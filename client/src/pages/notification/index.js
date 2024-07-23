import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../parent/KidList.css";
import "../style.css";
import leftArrow from "../../images/left-arrow.png";
import profile from "../../images/user.png";
import { notification } from "antd";

class KidList extends Component {
  componentDidMount() {
    let localStorage = window.localStorage;
    if (localStorage.islogin !== "1") {
      this.props.history.replace("/login");
    }
    this.loadData();
  }

  constructor(props) {
    super(props);
    let localStorage = window.localStorage;
    this.state = {
      username: localStorage.username,
      notifications: [],
    };
  }

  async loadData() {
    try {
      let notifications = await axios.get("/api/notification");
      this.setState({
        notifications: notifications.data.data,
      });
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }

  showKidDetails() {
    notification.info({
      message: "Developing...",
      title: "",
    });
  }

  render() {
    const { username, notifications } = this.state;
    return (
      <div>
        <div className="kid-list_title_bar">
          <Link to="/" className="kid-list__back_arrow">
            <img src={leftArrow} alt="" />
          </Link>
          <label className="kid-list_title_bar_center_title">{username}</label>
        </div>
        <div className="kid-list__title">Notification</div>

        {notifications.map((n) => (
          <div className="kid_list_item">
            <label className="kid_list_top_text kid_list_item_center ">
              {n.content}
            </label>
          </div>
        ))}
      </div>
    );
  }
}

export default KidList;
