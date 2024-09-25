import "../../scss/ForgetPasswords.scss";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function ForgetPasswords() {
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  function handleSendEmail() {
    const email = document.getElementById("enter-email").value;

    // Check if email is empty or not a valid format
    if (!email || !validateEmail(email)) {
      console.log("Email is not a valid format");
      toast.error("Please enter a valid email!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
      return;
    }
    toast.info("Please wait...", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 5000,
    });
    document.getElementById("enter-email").value = "";
    axios
      .post(SERVER_DOMAIN + "/user/forgotpassword", { email })
      .then(() => {
        // Handle the response from the server

        toast.success(
          "Please check your email to receive the password reset link.",
          {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 10000,
          }
        );
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error(error);
        toast.error("Something went wrong!\n" + error.response.data.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      });
  }

  // Function to validate email format
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  return (
    <div className="ForgetPassword flex a-center j-center">
      <div className="container">
        <div className="ForgetPassword_main">
          <div className="ForgetPassword_logo flex a-center">
            <img src="logo.png" alt="" />
            <h1>PTIT Student Infomation Exchange</h1>
          </div>
          <form action="">
            <span>
              Please enter your email address to search for your account.
            </span>
            <input type="email" id="enter-email" placeholder="Email Address" />
          </form>
          <div className="ForgetPassword_btns">
            <Link to="/">
              <button className="cancel-btns">Cancel</button>
            </Link>
            <button className="Send-email-btns" onClick={handleSendEmail}>
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ForgetPasswords;
