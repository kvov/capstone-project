import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../style.css";
import "./KidAdd.css";
import leftArrow from "../../images/left-arrow.png";
import { notification } from "antd";

class KidAdd extends Component {
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

  cancelKidAdd() {
    this.props.history.replace("/kids");
  }

  async handleKidSave() {
    
    const { username, kidName, kidNick, kidDob, kidPass } = this.state;

    if (kidName && kidPass) {
      try {
        let result = await axios.post("/api/kid", {
          parent: username,
          username: kidName,
          nickname: kidNick,
          dateOfBirth: kidDob,
          password: kidPass,
        });
        console.log("result:" + result);
      } catch (e) {
        notification.error({
          message: e.response.data.msg,
          title: "Error",
        });
      }
    } else {
      notification.error({
        message: "please input username and password",
        title: "Error",
      });
    }

  }

  render() {
    const { username, kidName, kidNick, kidDob, kidPass } = this.state;
    return (
      <div>
        <div className="style_title_bar">
          <Link to="/kids" className="style__back_arrow">
            <img src={leftArrow} alt="" />
          </Link>
          <label className="style_title_bar_center_title">{username}</label>
          <label className="kid_list_add"></label>
        </div>
        <div class="kid_list_top_text">Add a Kid</div>
        <div className="kid_add_form">
          <div>
            <input
              value={kidName}
              type="text"
              className="kid_add_item"
              placeholder="Your kid's username"
              onChange={(e) => {
                this.setState({ kidName: e.target.value });
              }}
            />
          </div>
          <div>
            <input
              value={kidNick}
              type="text"
              className="kid_add_item"
              placeholder="Your kid's nick name"
              onChange={(e) => {
                this.setState({ kidNick: e.target.value });
              }}
            />
          </div>
          <div>
            <input
              value={kidDob}
              type="date"
              className="kid_add_item kid_add_item__dob"
              placeholder="Your kid's date of birth"
              onChange={(e) => {
                this.setState({ kidDob: e.target.value });
              }}
            />
          </div>
          <div>
            <input
              value={kidPass}
              type="password"
              className="kid_add_item"
              placeholder="Your kid's password"
              onChange={(e) => {
                this.setState({ kidPass: e.target.value });
              }}
            />
          </div>

          <div className="kid_add_buttons">
            <button
              className="kid_add_save style_common_button style_common_button_green"
              onClick={() => this.handleKidSave()}
            >
              Save
            </button>
            <button
            className="kid_add_cancel style_common_button style_common_button_blue"
              onClick={() => this.cancelKidAdd()}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default KidAdd;
