import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../scss/Login.scss";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../AuthProvider";

// eslint-disable-next-line react/prop-types
function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { handleAdminLogin, token } = useAuth();
    const handelReturnButton = () => {
        navigate('/admin');
        window.location.reload();
    }
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
        handleAdminLogin(email, password);
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
                        <button onClick={handelReturnButton}>Return to Admin HomePage</button>
                        <img className="logo-school" src="\public\logo.png" alt="Logo" />
                        <h1>PTIT Student Infomation Exchange</h1>
                    </div>
                    <div className="form2 flex a-center j-center">
                        <form onSubmit={handleSubmit}>
                            <h2>ADMIN PTIT SOCIAL MEDIA </h2>
                            <p>Welcom to Posts & Telecoms Institute of Technology Social Web</p>
                            <nav>
                                <button
                                    type="button"
                                    className="login"
                                >
                                    Login
                                </button>
                            </nav>

                            <div className="login-container flex a-start j-start ">
                                <div
                                    style={{ width: "100%" }}
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

export default AdminLogin;
