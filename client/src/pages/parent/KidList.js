import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import profile from "../../images/user.png";
import { notification } from "antd";
import "./KidList.css";
import "../style.css";

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
      kids: [],
    };
  }

  async loadData() {
    console.log("load data");
    try {
      let result = await axios.get("/api/kids");
      let not = await axios.get("/api/notification");
      // console.log("result: " + JSON.stringify(result));
      console.log(not);
      this.setState({
        kids: result.data.data,
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
    const { username, kids } = this.state;
    return (
      <div className="kid-page">
        <Navbar username={username} />
        <div className="page-title">Manage Kids</div>

        <div className="kid-add-button-div">
          <Link to="/kidsAdd" className="kid-add-button">
            Add Kid
          </Link>
        </div>

        {kids.map((kid) => (
          <div className="kid_list_item">
            <img
              src={profile}
              alt=""
              className="kid_list_photo"
              style={{ height: 50, width: 50 }}
            />
            <label className="kid_list_top_text kid_list_item_center ">
              {/* Kid Name */}
              {kid.username}
            </label>
            <label className="kid_list_top_text kid_list_item_center ">
              0 Coins
            </label>
            <button
              className="kid-details-button"
              onClick={() => this.showKidDetails()}
            >
              Details
            </button>
          </div>
        ))}
      </div>
    );
  }
}

export default KidList;
