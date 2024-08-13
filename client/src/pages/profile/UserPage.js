import React, { Component } from "react";
import "../style.css";
import "./UserPage.css";
import { Link } from "react-router-dom";
import profile from "../../images/user.png";
import { notification, Badge } from "antd";
import axios from "axios";
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
class UserPage extends Component {
  async componentDidMount() {
    let localStorage = window.localStorage;
    if (localStorage.islogin !== "1") {
      this.props.history.replace("/login");
    } else {
      this.setState({
        username: capitalizeFirstLetter(localStorage.username),
        role: localStorage.role,
        profilePicture: localStorage.profilePicture || profile,
      });
      await this.fetchUnreadNotifications();
    }
  }

  constructor(props) {
    super(props);
    let localStorage = window.localStorage;
    this.state = {
      username: capitalizeFirstLetter(localStorage.username),
      role: localStorage.role,
      profilePicture: profile,
      unreadNotifications: 0,
    };
  }

  async fetchUnreadNotifications() {
    try {
      const response = await axios.get("api/notification/count");
      this.setState({ unreadNotifications: response.data.count });
      console.log(response.data.count);
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
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
    const { username, profilePicture, role, unreadNotifications } = this.state;
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
              <span onClick={this.clickWishes}>Wishes</span>
            </button>

            <button
              className="style_common_button style_common_button_blue"
              type="submit"
            >
              <Link to="/kidTasks">Tasks</Link>
            </button>
            <button
              className="style_common_button style_common_button_green notification_btn"
              type="submit"
            >
              <Badge
                className="badge"
                count={unreadNotifications}
                overflowCount={99}
              ></Badge>
              <Link to="/notifications">Messages</Link>
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
              <Link to="/parentWishes">Wishes</Link>
            </button>

            <button
              className="style_common_button style_common_button_purple"
              type="submit"
            >
              <Link to="/tasks">Tasks</Link>
            </button>

            <button
              className="style_common_button style_common_button_blue"
              type="submit"
            >
              <Link to="/kids">Kids</Link>
            </button>
            <button
              className="style_common_button style_common_button_purple notification_btn"
              type="submit"
            >
              <Badge
                className="badge"
                count={unreadNotifications}
                overflowCount={99}
              ></Badge>
              <Link to="/notifications">Messages</Link>
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
