import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./KidList.css";
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
      kids: [],
    };
  }

  async loadData() {
    console.log("load data");
    try {
      let result = await axios.get("/api/kids");
      // console.log("result: " + JSON.stringify(result));
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
      <div>
        <div className="style_title_bar">
          <Link to="/" className="style__back_arrow">
            <img src={leftArrow} alt="" />
          </Link>
          <label className="style_title_bar_center_title">{username}</label>
          <Link to="/kidsAdd" className="kid_list_add">
            Add Kid
          </Link>
        </div>
        <div className="kid_list_top_text">Manage Your Kids</div>

        {kids.map((kid) => (
          <div className="kid_list_item">
            <img
              src={profile}
              alt=""
              className="kid_list_photo"
              style={{ height: 100, width: 100 }}
            />
            <label className="kid_list_top_text kid_list_item_center ">
              {/* Kid Name */}
              {kid.username}
            </label>
            <label className="kid_list_top_text kid_list_item_center ">
              0 Coins
            </label>
            <button onClick={() => this.showKidDetails()}>Details</button>
          </div>
        ))}

        {/* {kids.map((item, index) => {
          <></>;
        })} */}
      </div>
    );
  }
}

export default KidList;
