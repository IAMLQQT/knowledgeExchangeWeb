import "../../../App.scss";
import AdminNavBar from "./NavBar/AdminNavbar";
import AdminHeader from "./Header/AdminHeader";
import { useAuth } from "../../../AuthProvider";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useState } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { Code } from "react-content-loader";
import InfiniteScroll from "react-infinite-scroll-component";
import { useUser } from "../../../UserProvider";
import UserManagement from "./Body/UserManagement";

export default function HomePage() {
  //const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true); // [true, function
  const [chatBoxes, setChatBoxes] = useState([]);
  const [refresher, setRefresher] = useState(false);
  const page = useRef(1);

  const { token } = useAuth();
  const { user, handleGetProfile } = useUser();
  const homeMatch = useMatch("/admin");

  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;

  useEffect(handleGetProfile, []);

  return (
    <div className="App">
 
      <div className="main-ctn">
        
        <div className="admincontainer">
        <AdminHeader user={user?.user} />
        
        <div className="content flex">
        <AdminNavBar />
        {homeMatch ? (
            <>
              <div className="usermanagament">
                <UserManagement />
              </div>
            </>
          ) : (
            <Outlet />
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
