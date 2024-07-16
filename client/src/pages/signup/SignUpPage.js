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
      profilePicture: "",
    };
  }

  handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.addEventListener('load', () => {
      this.setState({ profilePicture: reader.result });
    });
    reader.readAsDataURL(file);
  };

  render() {
    const { username, password, profilePicture } = this.state;
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
          <div className="user-data__photo-upload">
            <input
              style={{ display: 'none' }}
              type="file"
              accept=".jpg, .png, .jpeg"
              className="user-data__photo"
              onChange={this.handleFileUpload}
              ref={fileInput => this.fileInput = fileInput}
            />
            {!profilePicture ? (
              <button
                className="user-data__photo"
                onClick={() => this.fileInput.click()}
              >
                Select Photo
              </button>
            ) : (
              <img
                className="user-data__photo"
                src={profilePicture}
                alt="Profile"
              />
            )}
          </div>
          <div>
            <button className="signup_button" onClick={() => this.signup()}>
              Sign Up
            </button>
          </div>
          <div>
            <Link to="/" className="signup__login">
              Or Login?
            </Link>
          </div>
        </div>

        <label className="slogan">
          ORGANISE<br/>KIDS
        </label>
      </div>
    );
  }
  async signup() {
    const { username, password, profilePicture } = this.state;

    if (username && password) {
      try {
        await axios.post("/api/signup", {
          username: username,
          password: password,
          profilePicture: profilePicture,
        });

        let localStorage = window.localStorage;
        localStorage.username = username;
        localStorage.islogin = "1";
        localStorage.profilePicture = profilePicture;

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
