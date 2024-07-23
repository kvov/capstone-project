import React, { Component } from "react";
import axios from "axios";
import { notification } from "antd";
import Navbar from "../../components/Navbar";
import dayjs from "dayjs";

// import "../parent/KidList.css";
import "../style.css";
import "./index.css";
function getTimeDifferenceFromNow(isoTimestamp) {
  const now = dayjs();
  const timestamp = dayjs(isoTimestamp);
  const differenceInSeconds = now.diff(timestamp, "second");
  const differenceInMinutes = now.diff(timestamp, "minute");
  const differenceInHours = now.diff(timestamp, "hour");
  const differenceInDays = now.diff(timestamp, "day");
  const differenceInWeeks = now.diff(timestamp, "week");
  const differenceInMonths = now.diff(timestamp, "month");
  const differenceInYears = now.diff(timestamp, "year");

  if (differenceInSeconds < 60) {
    return `${differenceInSeconds} seconds ago`;
  } else if (differenceInMinutes < 60) {
    return `${differenceInMinutes} minutes ago`;
  } else if (differenceInHours < 24) {
    return `${differenceInHours} hours ago`;
  } else if (differenceInDays < 7) {
    return `${differenceInDays} days ago`;
  } else if (differenceInWeeks < 4) {
    return `${differenceInWeeks} weeks ago`;
  } else if (differenceInMonths < 12) {
    return `${differenceInMonths} months ago`;
  } else {
    return `${differenceInYears} years ago`;
  }
}
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
        notifications: notifications.data.data
          .filter((d) => !!d.created_at)
          .sort((a, b) => dayjs(b.create_at).diff(dayjs(a.create_at))),
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
      <div className="notification-page">
        <Navbar username={username} />
        <div className="page-title">Notification</div>
        {notifications.map((n) => (
          <div className="notification_list_item">
            <label className="notification_list_top_text notification_list_item_center ">
              {`${getTimeDifferenceFromNow(n.created_at)}: ${n.content}`}
            </label>
          </div>
        ))}
      </div>
    );
  }
}

export default KidList;
