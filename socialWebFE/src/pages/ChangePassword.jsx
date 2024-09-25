import { useState } from "react";
import "../scss/ChangePassword.scss";

import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { token } = useAuth();
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;

  function validatePassword(password) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }
  const handleSubmit = () => {
    if (oldPassword === "") return;

    if (newPassword !== confirmPassword) {
      toast.error("Confirm Password is not correct!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      return;
    }
    if (!validatePassword(confirmPassword)) {
      toast.warning("New Password is not valid!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      return;
    }

    axios
      .post(
        SERVER_DOMAIN + "/user/updatePassword",
        {
          currentPassword: oldPassword,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        toast.success("Change password succesfully!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        localStorage.removeItem("token");
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
        if (err?.response?.status === 401) {
          toast.error("Wrong password!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
          return;
        }
      });
  };
  return (
    <div className="ChangePassword flex a-center j-ceenter">
      <div className="container">
        <div className="ChangePassword_main">
          <div className="ChangePassword_logo flex a-center">
            <img src="public\logo.png" alt="" />
            <h1>PTIT Student Infomation Exchange</h1>
          </div>
          <form action="">
            <span>Change Password</span>
            <div className="input-group">
              <label htmlFor="enter-old-password">Enter Old Password</label>
              <input
                type="password"
                id="enter-old-password"
                placeholder="Enter Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="enter-new-password">Enter New Password</label>
              <input
                type="password"
                id="enter-new-password"
                placeholder="Enter Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirm-new-password">
                Confirm New Password{" "}
              </label>
              <input
                type="password"
                id="confirm-new-password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                minLength={8}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </form>
          <div>
            <button
              className="confirm-btn"
              type="button"
              onClick={handleSubmit}
            >
              Confirm
            </button>
          </div>

          <div className="password-rule">
            <h2>Password must have</h2>
            <ul>
              <li>Minimum length of 8 characters</li>
              <li> At least one lowercase letter</li>
              <li>At least one uppercase letter</li>
              <li> At least one digit</li>
              <li> At least one special character from the set [@$!%*?&]</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;