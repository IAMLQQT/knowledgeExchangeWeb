import { Link, NavLink, useLocation } from "react-router-dom";
import "../../../../scss/AdminNavBar.scss";
import { useUser } from "../../../../UserProvider";
import { useState } from "react";

const routes = ["home", "messages", "profile", "saved-post", "users"];
function AdminNavbar() {
  const { user } = useUser();
  const user_id = user?.user?.user_id;
  const location = useLocation();
  const [tabSelected, setTabSelected] = useState(
    routes.filter((route) => location.pathname.includes(route)).reverse()[0]
  );

  return (
    <div className="adminnavbar">
      <ul>
        <li>
          <Link
            to="usermanagement"
            onClick={() => setTabSelected("usermanagement")}
            className={`${tabSelected === "usermanagement" && "active"} `}
          >
            <i className="fa-solid fa-house"></i>
            <p>User Management</p>
          </Link>
        </li>

        <li>
          <Link to="postmanagement"
            onClick={() => setTabSelected("postmanagement")}
            className={`${tabSelected === "postmanagement" && "active"} `}>
            <i className="fa-solid fa-message"></i>

            <p>Post Management</p>
          </Link>
        </li>
        <li>
          <Link to="commentmanagement"
            onClick={() => setTabSelected("commentmanagement")}
            className={`${tabSelected === "commentmanagement" && "active"} `}
          >
            <i className="fa-solid fa-id-card"></i>
            <p>Comment Report Management</p>
          </Link>
        </li>
        <li>
          <Link to="forummanagement"
            onClick={() => setTabSelected("forummanagement")}
            className={`${tabSelected === "forummanagement" && "active"} `}
          >
            <i className="fa-solid fa-id-card"></i>
            <p>Forum Management</p>
          </Link>
        </li>
        <li></li>
      </ul>
    </div>
  );
}

export default AdminNavbar;