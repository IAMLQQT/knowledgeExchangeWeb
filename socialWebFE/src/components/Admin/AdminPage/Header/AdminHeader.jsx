
import "../../../../scss/AdminHeader.scss";
import PropTypes from "prop-types";
import ContentLoader from "react-content-loader";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../AuthProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import NotificationModel from "../../../Body/Modals/NotificationModal";
AdminHeader.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    profile_picture: PropTypes.string.isRequired,
  }),
};
function AdminHeader({ user, tabSelected, setTabSelected }) {
  const [isDropdown, setIsDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { handleAdminLogout, token } = useAuth();
  const modalRef = useRef();
  const searchRef = useRef();
  const advancedSearchRef = useRef();
  const handelLoginButton = () => {
    navigate('/admin/login');
  }
  const handleButtonClick = (buttonType) => {
    switch (buttonType) {
      case "profile":
        setIsDropdown(false);
        navigate("/profile/" + user.user_id);

        break;
      case "logout":
        handleAdminLogout();
        break;
      case "settings":
        setIsDropdown(false);
        navigate("/profiledetail");

        break;
      default:
        break;
    }
  };
  const handleDropdown = () => {
    setIsDropdown(!isDropdown);
  };
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !searchRef.current.contains(event.target) &&
        isAdvancedSearchOpen
      ) {
        console.log(modalRef.current);

        setIsDropdown(false);
        setIsAdvancedSearchOpen(false);
      }
    };

    if (isDropdown || isAdvancedSearchOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDropdown, isAdvancedSearchOpen]);
  return (
    <div className=" adminheader flex a-center j-between">
      <div className="admin-logo-ctn flex a-center">
        <img src="/logo.png" alt="logo" />
        <div>
          <h1>ADMIN</h1>
          <h1>PTIT Student Infomation Exchange</h1>
        </div>
       
      </div>
      <div className="info-ctn flex a-center">
        {token && <> <div className="user-notification">
          <NotificationModel />
        </div>
          <div className="user-info flex a-center" ref={modalRef}>
            {user ? (
              <>
                <div className="user-ava" onClick={() => handleDropdown()}>
                  <img
                    crossOrigin="anonymous"
                    src={
                      user.profile_picture ? user.profile_picture : "/user.png"
                    }
                    alt="user-ava"
                    className="ava"
                    onError={(e) => {
                      e.target.src = "/public/user.png";
                    }}
                  />
                  <img
                    src="/up-arrow.png"
                    alt="dropdown"
                    className="icon"
                    onError={(e) => {
                      e.target.src = "/public/user.png";
                    }}
                  />
                </div>
                {isDropdown ? (
                  <ul className="menu">
                    <li className="menu-item">
                      <button
                        className=""
                        onClick={() => handleButtonClick("profile")}
                      >
                        <img
                          crossOrigin="anonymous"
                          src={
                            user?.profile_picture
                              ? user?.profile_picture
                              : "/public/user.png"
                          }
                          onError={(e) => {
                            e.target.src = "/public/user.png";
                          }}
                          alt="user-ava"
                          className="ava"
                        />
                        <div className="flex">
                          <div className="user-name">
                            <p>{`${user?.first_name || ""} ${user?.last_name || ""
                              }`}</p>
                            <p>{user?.email || ""}</p>
                          </div>
                        </div>
                      </button>
                    </li>
                    <li className="menu-item">
                      <button onClick={() => handleButtonClick("settings")}>
                        <img src="/settings.png" alt="setting-icon" />
                        <p>Edit my profile</p>
                      </button>
                    </li>
                    <li className="menu-item">
                      <button onClick={() => handleButtonClick("logout")}>
                        <img src="/logout.png" alt="activity-icon" />
                        <p>Log out</p>
                      </button>
                    </li>
                  </ul>
                ) : null}
              </>
            ) : (
              <ContentLoader
                speed={5}
                width={50}
                height={50}
                viewBox="0 0 400 160"
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
                className="user-info"
              >
                <rect x="0" y="56" rx="3" ry="3" width="410" height="6" />
                <rect x="0" y="72" rx="3" ry="3" width="380" height="6" />
                <rect x="0" y="88" rx="3" ry="3" width="178" height="6" />
              </ContentLoader>
            )}

          </div></>}
        {!token && <button className="login" onClick={handelLoginButton}>Login</button>
        }
      </div>
    </div>
  );
}

export default AdminHeader;