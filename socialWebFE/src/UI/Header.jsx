/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import "../scss/Header.scss";

import PropTypes from "prop-types";
import ContentLoader from "react-content-loader";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import NotificationModel from "../UI/NotificationModel";
Header.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    profile_picture: PropTypes.string.isRequired,
  }),
};
function Header({ user, tabSelected, setTabSelected }) {
  const [isDropdown, setIsDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { handleLogout ,token} = useAuth();
  const modalRef = useRef();
  const searchRef = useRef();
  const advancedSearchRef = useRef();
  const handelLoginButton = () => {
    navigate('/login');
  }
  const handleButtonClick = (buttonType) => {
    switch (buttonType) {
      case "profile":
        setIsDropdown(false);
        navigate("/profile/" + user.user_id);

        break;
      case "logout":
        handleLogout();
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

  const handelSearch = (e) => {
    if (e.key === "Enter" && search.trim() !== "") {
      navigate("/search?q=" + encodeURIComponent(search));
    }
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
    <div className="header flex a-center j-between">
      <div className="nav-header flex a-center j-center">
        <p
          className={`${tabSelected === "explore" && "active"}`}
          onClick={() => {
            setTabSelected("explore");
            navigate("/login");
          }}
        >
          Explore
        </p>
        <p
          className={`${tabSelected === "community" && "active"} `}
          onClick={() => {
            setTabSelected("community");
            navigate("/login");
          }}
        >
          My Community hello thinh
        </p>
      </div>

      <div className="info-ctn flex a-center">
        <div className="search-bar">
          <input
            id="searchbar"
            className="search-input"
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            ref={searchRef}
            onKeyDown={handelSearch}
            onFocus={() => {
              setIsAdvancedSearchOpen(true);
              setIsDropdown(false);
            }}
          />
        </div>
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
         
        </div></> }
        {!token && <button className="login" onClick={handelLoginButton}>Login</button>
          }
      </div>
    </div>
  );
}

export default Header;