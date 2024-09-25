
import "../../scss/SetInitialPassword.scss";


function SetInitialPassword() {
    return (
        <div className="SetInitialPassword flex a-center j-ceenter">
            <div className="container">
                <div className="SetInitialPassword_main">
                    <div className="SetInitialPassword_logo flex a-center">
                        <img src="public\logo.png" alt="" />
                        <h1>DHKH Student Infomation Exchange</h1>
                    </div>
                    <form action="">
                        <span>Set Initial Password</span>
                        <div className="input-group">
                            <label htmlFor="enter-password">Enter Password</label>
                            <input type="password" id="enter-password" placeholder="Enter Password" />
                        </div>
                        <div className="input-group">
                            <label htmlFor="confirm-password">Confirm Password </label>
                            <input type="password" id="confirm-password" placeholder="Confirm Password" />
                        </div>
                    </form>
                    <div className="SetInitialPassword_btns">
                        <button className="confirm-btn">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SetInitialPassword