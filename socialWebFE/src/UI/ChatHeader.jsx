import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { useUser } from "../UserProvider";
import ContentLoader from "react-content-loader";
import "../scss/ChatHeader.scss";
function ChatHeader() {
  const [isDropdown, setIsDropdown] = useState(false);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const navigate = useNavigate();

  const { user, handleGetProfile } = useUser();
  const userProfile = user.user;
  const { handleLogout } = useAuth();
  const modalRef = useRef();
  const searchRef = useRef();
  const resultRef = useRef();

  const handleButtonClick = (buttonType) => {
    switch (buttonType) {
      case "profile":
        setIsDropdown(false);
        navigate("/profile/" + userProfile.user_id);

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
  useEffect(() => {
    if (user.length == 0) handleGetProfile();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !searchRef.current.contains(event.target)
      ) {
        console.log(modalRef.current.contains(event.target), resultRef);

        setIsDropdown(false);
        setIsResultModalOpen(false);
      }
    };

    if (isDropdown || isResultModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDropdown, isResultModalOpen]);
  return (
    <div className="chat-header">
      <div className="search-ctn">
        <img src="/logo.png" alt="logo" onClick={() => navigate("/login")} />
      </div>
      <div className="user-info flex a-center" ref={modalRef}>
        {user ? (
          <>
            <div className="user-ava" onClick={() => handleDropdown()}>
              <img
                crossOrigin="anonymous"
                src={
                  userProfile?.profile_picture
                    ? userProfile?.profile_picture
                    : "/user.png"
                }
                alt="user-ava"
                className="ava"
                onError={(e) => {
                  e.target.src = "/public/user.png";
                }}
              />
              <img src="/up-arrow.png" alt="dropdown" className="icon" />
            </div>
            {isDropdown ? (
              <ul className="menu">
                <li className="menu-item">
                  <button
                    className="flex a-center"
                    onClick={() => handleButtonClick("profile")}
                  >
                    <img
                      crossOrigin="anonymous"
                      src={
                        userProfile?.profile_picture
                          ? userProfile?.profile_picture
                          : "/public/user.png"
                      }
                      alt="user-ava"
                      className="ava"
                    />
                    <div className="flex">
                      <div className="user-name">
                        <p>{`${userProfile?.first_name || ""} ${
                          userProfile?.last_name || ""
                        }`}</p>
                        <p>{userProfile?.email || ""}</p>
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
      </div>
    </div>
  );
}

export default ChatHeader;