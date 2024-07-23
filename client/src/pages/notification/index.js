import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import leftArrow from "../../images/left-arrow.png";
import { notification } from "antd";
import Navbar from "../../components/Navbar";

// import "../parent/KidList.css";
import "../style.css";
import "./index.css";
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
        <Navbar username={username} />
        <div className="page-title">Notification</div>
        {notifications.map((n) => (
          <div className="notification_list_item">
            <label className="notification_list_top_text notification_list_item_center ">
              {n.content}
            </label>
          </div>
        ))}
      </div>
    );
  }
}

export default KidList;
