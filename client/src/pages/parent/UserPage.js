import React, { Component } from "react";
import '../style.css'
import "./UserPage.css";
import { Link } from "react-router-dom";
import profile from "../../images/user.png";

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
    };
  }

  render() {
    const { username, photo } = this.state;
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
      </div>
    );
  }
}

export default UserPage;
