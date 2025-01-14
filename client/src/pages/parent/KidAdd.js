import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../style.css";
import "./KidAdd.css";
import Navbar from "../../components/Navbar";
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
      kidName: "",
      kidNick: "",
      kidDob: "",
      kidPass: "",
      profilePicture: null,
    };
  }

  handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.addEventListener('load', () => {
      this.setState({ profilePicture: reader.result });
    });
    reader.readAsDataURL(file);
  };

  cancelKidAdd() {
    this.props.history.replace("/kids");
  }

  // Method to validate inputs
  validateInputs() {
    const { kidName, kidNick, kidDob } = this.state;
    const nameRegex = /^[A-Za-z]+$/; 

    if (!nameRegex.test(kidName)) {
      notification.error({
        message: "Kid's username must contain only letters",
        title: "Error",
      });
      return false;
    }

    if (!nameRegex.test(kidNick)) {
      notification.error({
        message: "Kid's nickname must contain only letters",
        title: "Error",
      });
      return false;
    }

    const selectedDate = new Date(kidDob);
    const today = new Date();
    if (selectedDate >= today) {
      notification.error({
        message: "Date of birth must be in the past",
        title: "Error",
      });
      return false;
    }

    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
    if (selectedDate <= eighteenYearsAgo) {
      notification.error({
        message: "Child cannot be more than 18 years old",
        title: "Error",
      });
      return false;
    }

    return true;
  }

  async handleKidSave() {
    if (!this.validateInputs()) { 
      return;
    }

    const { username, kidName, kidNick, kidDob, kidPass, profilePicture } = this.state;

    if (kidName && kidPass) {
      try {
        let result = await axios.post("/api/kid", {
          parent: username,
          username: kidName,
          nickname: kidNick,
          dateOfBirth: kidDob,
          password: kidPass,
          profilePicture: profilePicture,
          parent: localStorage.id,
        });
        notification.success({
          message: "Success",
          title: "Success",
        });
        setTimeout(() => {
          this.props.history.replace("kids");
        }, 2000);

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
    const { username, kidName, kidNick, kidDob, kidPass, profilePicture } = this.state;
    return (
      <div className="kid-add-page">
        <Navbar username={username} />
        <div className="page-title">Add Kid</div>
        <div className="kid_add_form">
          <div className="kid_add_form__inner">

          <div className="user-data__photo-upload">
            <input
              style={{ display: 'none' }}
              type="file"
              accept=".jpg, .png, .jpeg"
              className="user-data__photo"
              onChange={this.handleFileUpload}
              ref={fileInput => this.fileInput = fileInput}
            />
            {!profilePicture ? (
              <button
                className="user-data__photo"
                onClick={() => this.fileInput.click()}
              >
                Select Photo
              </button>
            ) : (
              <img
                className="user-data__photo"
                src={profilePicture}
                alt="Profile"
              />
            )}
          </div>

            <input
              value={kidName}
              type="text"
              className="kid_add_item"
              placeholder="Your kid's username"
              onChange={(e) => {
                this.setState({ kidName: e.target.value });
              }}
            />
          
          
            <input
              value={kidNick}
              type="text"
              className="kid_add_item"
              placeholder="Your kid's nick name"
              onChange={(e) => {
                this.setState({ kidNick: e.target.value });
              }}
            />
          
          
            <input
              value={kidDob}
              type="date"
              className="kid_add_item kid_add_item__dob"
              placeholder="Your kid's date of birth"
              max={new Date().toISOString().split("T")[0]} 
              onChange={(e) => {
                this.setState({ kidDob: e.target.value });
              }}
            />
          
          
            <input
              value={kidPass}
              type="password"
              className="kid_add_item"
              placeholder="Your kid's password"
              onChange={(e) => {
                this.setState({ kidPass: e.target.value });
              }}
            />
          

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
    </div>
    );
  }
}

export default KidAdd;
