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
    }
  }

  constructor(props) {
    super(props);
    let localStorage = window.localStorage;
    this.state = {
      username: localStorage.username,
      role: localStorage.role,
    };
  }

  clickWishes() {
    notification.info({
      message: "Developing...",
      title: "",
    });
  }

  render() {
    const { username, photo, role } = this.state;
    return (
      <div className="user-content">
        <div className="user-data__form">
          <p className="user-profile__name">{username}</p>
          <p className="user-profile__photo-wrapper">
            {photo ? (
              <img className="user-profile__photo" src={photo} alt="" />
            ) : (
              <img
                src={profile}
                alt=""
                className="execute-task-btn__image"
                style={{ height: 100, width: 100 }}
              />
            )}
          </p>
          <br />
        </div>

        {role == "kid" ? (
          <div className="user-profile-page__buttons">
            <button
              className="style_common_button style_common_button_green"
              type="submit"
            >
              {/* <Link to="/wishes">Wishes</Link> */}
              <span onClick={this.clickWishes}>Wishes</span>
            </button>
            <br></br>
            <button
              className="style_common_button user-page-button__task"
              type="submit"
            >
              <Link to="/kidTasks">Tasks</Link>
            </button>
            <br></br>
          </div>
        ) : (
          <div className="user-profile-page__buttons">
            <button
              className="style_common_button style_common_button_green"
              type="submit"
            >
              <Link to="/wishes">See Wishes</Link>
            </button>
            <br></br>
            <button
              className="style_common_button user-page-button__task"
              type="submit"
            >
              <Link to="/tasks">Add Tasks</Link>
            </button>
            <br></br>
            <button
              className="style_common_button style_common_button_blue"
              type="submit"
            >
              <Link to="/kids">Kid List</Link>
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default UserPage;
