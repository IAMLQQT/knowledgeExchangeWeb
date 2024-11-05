import axios from "axios";

import PropTypes from "prop-types";
import { useContext } from "react";
import { createContext } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const AuthContext = createContext();
function AuthProvider({ children }) {
  const localToken = localStorage.getItem("token") || null;
  const [token, setToken] = useState(localToken);
  const navigate = useNavigate();
  const location = useLocation();
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;

  const handleLogin = (email, password) => {
    toast.info("Logging in...", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 2000,
    });
    axios
      .post(`${SERVER_DOMAIN}/user/login`, {
        email,
        password,
      })
      .then((res) => {
        console.log(res);
        toast.success("Login successfully!", {
          position: toast.POSITION.BOTTOM_LEFT,
          autoClose: 1000,
        });
        //Cookies.set("token", res.data.token, { expires: 3 });
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        if (res.data.passwordVersion === 0) {
          toast.error("You must change password for the frist login!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
          navigate("/changepassword"); // Adjust route as needed
          localStorage.removeItem("token");
        } else {
          const nextLocation = location.state?.from.pathName || "/";
          navigate(nextLocation);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 401) {
          toast.error("Wrong email or password!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
          return;
        }
        toast.error(
          error.response?.data.message +
          "\nSomething went wrong! Please try again!",
          {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          }
        );
      });
  };
  const handleLogout = () => {
    setToken(null);
    navigate("/login");
    localStorage.removeItem("token");
  };
  const value = { handleLogin, handleLogout, token, setToken };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
