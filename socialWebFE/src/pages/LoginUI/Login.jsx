import { Link, Navigate, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import "../../scss/Login.scss";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../AuthProvider";

// eslint-disable-next-line react/prop-types
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("login");
  const { handleLogin, token } = useAuth();
  const handelReturnButton = () => {
    navigate('/');
    window.location.reload();
  }
  const handleSuccess = (response) => {
    axios
      .post("http://127.0.0.1:3000/user/googleSignIn", {
        tokenId: response.credential,
        withCredentials: true,
      })
      .then(() => {
        toast.success("Please check your email for initial password!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 10000,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          "Sign in failed! Please try again!\n" + error.response.data.message,
          {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 10000,
          }
        );
      });
  };
  const errorMessage = (error) => {
    console.log(error);
  };
  const validateInputs = () => {
    let isValid = true;

    if (email.trim() === "") {
      isValid = false;
      toast.error("Please enter your email", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      isValid = false;
      toast.error("Please enter a valid email", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
    }

    if (password.trim() === "") {
      isValid = false;
      toast.error("Please enter your password", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }
    handleLogin(email, password);
    setEmail("");
    setPassword("");
  };
  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-page flex a-center j-center">
      <div className="container">
        <div className="form flex j-center j-center">
          <div className="logo flex a-center j-center">
            <button onClick={handelReturnButton}>Return to HomePage</button>
            <img className="logo-school" src="public\logo.png" alt="Logo" />
            <h1>PTIT Student Infomation Exchange</h1>
          </div>
          <div className="form2 flex a-center j-center">
            <form onSubmit={handleSubmit}>
              <h2>PTIT SOCIAL MEDIA</h2>
              <p>Welcom to Posts & Telecoms Institute of Technology Social Web</p>
              <nav>
                <button
                  type="button"
                  className="login"
                  onClick={() => setTab("login")}
                >
                  Login
                </button>

                <button type="button" onClick={() => setTab("register")}>
                  Register
                </button>
              </nav>

              <div className="login-container flex a-start j-start ">
                <div
                  className={`sign-up-gg ${tab === "login" ? "hidden" : ""} `}
                >
                  <GoogleLogin
                    onSuccess={handleSuccess}
                    onFailure={errorMessage}
                    onError={errorMessage}
                    width="340"
                    text="signup_with"
                  />
                </div>
                <div
                  style={{ width: "100%" }}
                  className={`${tab === "login" ? "" : "hidden"} `}
                >
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="E-mail Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="remember-me">
                    <input id="remember-me" type="checkbox" />
                    <label htmlFor="remember-me">Remember me</label>
                  </div>

                  <div className="btn">
                    <button type="submit">
                      <a>Login</a>
                    </button>
                    <Link className="forget" to="/forgetpassword">
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
