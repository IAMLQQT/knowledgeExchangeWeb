import "../../scss/ResetPassword.scss";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
function ResetPassword() {
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const { token } = useParams();
  const navigate = useNavigate();
  function handdleResetPassword() {
    const password = document.getElementById("enter-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    console.log(SERVER_DOMAIN);
    if (!password || !confirmPassword || password.length < 6) {
      toast.error("Please enter a valid password!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      return;
    }
    axios
      .patch(SERVER_DOMAIN + "/user/resetPassword/" + token, {
        password,
      })
      .then(() => {
        // Handle the response from the server
        toast.success("Password changed successfully!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
        navigate("/login");
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        if (error.response.status === 401) {
          toast.error("Your token is invalid!\n ", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
          navigate("/forgetpassword");
          return;
        }
        toast.error("Something went wrong!\n" + error.response.data.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      })
      .finally(() => {
        document.getElementById("enter-password").value = "";
        document.getElementById("confirm-password").value = "";
      });
  }
  return (
    <div className="ResetPassword flex a-center j-ceenter">
      <div className="container">
        <div className="ResetPassword_main">
          <div className="ResetPassword_logo flex a-center">
            <img src="/logo.png" alt="logo" />
            <h1>PTIT Student Infomation Exchange</h1>
          </div>
          <form action="">
            <span>Reset Password</span>

            <div className="input-group">
              <label htmlFor="enter-password">Enter New Password</label>
              <input
                type="password"
                id="enter-password"
                placeholder="Enter New Password"
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                placeholder="Confirm New Password"
              />
            </div>
          </form>
          <div className="description">
            Password must have 6 characters at least!
          </div>
          <div className="ResetPassword_btns">
            <button className="confirm-btn" onClick={handdleResetPassword}>
              Confirm
            </button>
            <button className="confirm-btn" onClick={()=>navigate("/login")}>
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
