import React, { Component } from "react";
import axios from "axios";
import { notification } from "antd";
import Navbar from "../../components/Navbar";
import dayjs from "dayjs";
import removeBtn from "../../images/remove.png";
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
class NotificationsPage extends Component {
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
      let response = await axios.get("/api/notification");
      let notifications = response.data.data;
  
      this.setState({
        notifications: notifications
          .filter((d) => !!d.created_at)
          .sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at))),
      });

      await axios.put("/api/notification/read"); 
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }
  
  async deleteNotification(notificationId) {
    try {
      await axios.delete(`/api/notification/${notificationId}`);
      this.setState((prevState) => ({
        notifications: prevState.notifications.filter(n => n._id !== notificationId)
      }));
      notification.success({
        message: "Notification deleted successfully",
        title: "Success",
      });
    } catch (e) {
      notification.error({
        message: e.response?.data?.message || "Error deleting notification",
        title: "Error",
      });
    }
  }

  render() {
    const { username, notifications } = this.state;
    return (
      <div className="notification-page">
        <Navbar username={username} />
        <div className="content-page">
        <div className="page-title">Messages</div>
        <div className="notification-page_content">
          {notifications.map((n) => (
            <div key={n._id} className="notification_list_item">
              <label className="notification_list_top_text notification_list_item_center ">
                {`${getTimeDifferenceFromNow(n.created_at)}: ${n.content}`}
              </label>
              
              <div className="wish-card__action-item">
                      <button
                        className="wish-item__remove-from-list"
                        onClick={() => this.deleteNotification(n._id)}
                      >
                        <img
                          src={removeBtn}
                          alt="Remove"
                          className="remove-btn__image"
                        />
                      </button>
                    </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    );
  }
}

export default NotificationsPage;
