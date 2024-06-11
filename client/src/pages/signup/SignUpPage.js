import { Component } from "react";
import { Link } from "react-router-dom";
import "./SignUpPage.css";
import axios from "axios";
import { notification } from "antd";

class SignUpPage extends Component {
  componentDidMount() {
    let localStorage = window.localStorage;
    if (localStorage.islogin === "1") {
      this.props.history.replace("/");
    }
  }
  
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
  }

  render() {
    const { username, password } = this.state;
    return (
      <div className="signup-content">
        <div className="signup__form">
          <div>
            <input
              value={username}
              type="text"
              className="signup__item "
              onChange={(e) => {
                this.setState({ username: e.target.value });
              }}
              placeholder="Enter Your Username"
            />
          </div>
          <div>
            <input
              value={password}
              type="password"
              className="signup__item"
              onChange={(e) => {
                this.setState({ password: e.target.value });
              }}
              placeholder="Enter Your Password"
            />
          </div>
          <div>
            <button className="signup_button" onClick={() => this.signup()}>
              Sign Up
            </button>
          </div>
          <div>
            <Link to="/">
              <a className="signup__login">Or Login?</a>
            </Link>
          </div>
        </div>

        <label className="slogan">
          ORGANISE<br></br>KIDS
        </label>
      </div>
    );
  }
  async signup() {
    const { username, password } = this.state;

    if (username && password) {
      try {
        await axios.post("/api/signup", {
          username: username,
          password: password,
        });

        let localStorage = window.localStorage;
        localStorage.username = username;
        localStorage.islogin = "1";

        this.props.history.push("/");
      } catch (e) {
        console.log(`e.response.data.msg: ${e}`)
        notification.error({
          message: e.response.data.msg,
          title: "Error",
        });
      }
    } else {
      notification.error({
        message: "please input username and password",
        title: "Error",
      });
    }
  }
}

export default SignUpPage;
