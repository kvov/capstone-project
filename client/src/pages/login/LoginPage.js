import { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { notification } from "antd";
import "./LoginPage.css";

class LoginPage extends Component {
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
      <div className="login-content">
        <div className="login__form">
          <div>
            <input
              value={username}
              type="text"
              className="login__item login__item__email"
              placeholder="Enter Your username"
              onChange={(e) => {
                this.setState({ username: e.target.value });
              }}
            />
          </div>
          <div>
            <input
              value={password}
              type="password"
              className="login__item login__item__password"
              placeholder="Enter Your Password"
              onChange={(e) => {
                this.setState({ password: e.target.value });
              }}
            />
          </div>

          <div>
            <button className="login_button" onClick={() => this.handleLogin()}>
              Login
            </button>
          </div>
          <div>
            <Link to="/signUp">
              <a className="login__signup"> Or SignUp?</a>
            </Link>
          </div>
        </div>

        <label className="slogan">
          ORGANISE<br></br>KIDS
        </label>
      </div>
    );
  }

  async handleLogin() {
    const { username, password } = this.state;
    if (username && password) {
      try {
        const { data } = await axios.post("/api/login", {
          username: username,
          password: password,
        });
        const { id, role } = data.data;

        let localStorage = window.localStorage;
        localStorage.username = username;
        localStorage.islogin = "1";
        localStorage.role = role;
        localStorage.id = id;

        this.props.history.replace("/");
      } catch (e) {
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

export default LoginPage;
