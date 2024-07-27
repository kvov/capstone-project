import React, { Component } from "react";
import "../style.css";
import "./UserPage.css";
import { Link } from "react-router-dom";
import profile from "../../images/user.png";
import { notification } from "antd";

class UserPage extends Component {
  componentDidMount() {
    let localStorage = window.localStorage;
    if (localStorage.islogin !== "1") {
      this.props.history.replace("/login");
    } else {
      this.setState({
        username: localStorage.username,
        role: localStorage.role,
        profilePicture: localStorage.profilePicture || profile, 
      });
    }
  }

  constructor(props) {
    super(props);
    let localStorage = window.localStorage;
    this.state = {
      username: localStorage.username,
      role: localStorage.role,
      profilePicture: profile,
    };
  }

  clickWishes = () => {
    const { role } = this.state;
    if (role === "kid") {
      this.props.history.push("/wishList");
    } else {
      notification.info({
        message: "Developing...",
        title: "",
      });
    }
  };

  logout() {
    localStorage.clear();
    this.props.history.replace("/login");
  }

  render() {
    const { username, profilePicture, role } = this.state;
    return (
      <div className="user-content">
        <div className="user-data__form">
          <p className="user-profile__name">{username}</p>
          <p className="user-profile__photo-wrapper">
            {profilePicture ? (
              <img
                className="user-profile__photo"
                src={profilePicture}
                alt="Profile"
              />
            ) : (
              <img src={profile} alt="" className="user-profile__photo" />
            )}
          </p>
          <br />
        </div>

        {role === "kid" ? (
          <div className="user-profile-page__buttons kid-buttons">
            <button
              className="style_common_button style_common_button_green"
              type="submit"
            >
              {/* <Link to="/wishes">Wishes</Link> */}
              <span onClick={this.clickWishes}>Wishes</span>
            </button>

            <button
              className="style_common_button style_common_button_blue"
              type="submit"
            >
              <Link to="/kidTasks">Tasks</Link>
            </button>
            <button
              className="style_common_button style_common_button_green"
              type="submit"
            >
              <Link to="/notifications">Notifications</Link>
            </button>

            <button
              className="style_common_button style_common_button_purple"
              onClick={() => {
                this.logout();
              }}
            >
              <Link to="/kids">Log out</Link>
            </button>
          </div>
        ) : (
          <div className="user-profile-page__buttons parent-buttons">
            <button
              className="style_common_button style_common_button_green"
              type="submit"
            >
              <Link to="/parentWishes">See Wishes</Link>
            </button>

            <button
              className="style_common_button style_common_button_purple"
              type="submit"
            >
              <Link to="/tasks">Add Tasks</Link>
            </button>

            <button
              className="style_common_button style_common_button_blue"
              type="submit"
            >
              <Link to="/kids">Kid List</Link>
            </button>
            <button
              className="style_common_button style_common_button_purple"
              type="submit"
            >
              <Link to="/notifications">Notifications</Link>
            </button>

            <button
              className="style_common_button style_common_button_green"
              onClick={() => {
                this.logout();
              }}
            >
              <Link to="/kids">Log out</Link>
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default UserPage;
