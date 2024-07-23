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
      <div className="kid-page">
        <Navbar username={username} />
        <div className="page-title">Manage Kids</div>
  
        <div className="kid-add-button-div">
          <Link to="/kidsAdd" className="kid-add-button">
            Add Kid
          </Link>
        </div>
  
        <div className="kid-page__kid-list-div">
          <div className="kid-page__kid-list">
            {kids.map((kid) => (
              <div className="kid-card" key={kid._id}>
                <div className="kid-card__content">
                  <img
                    src={profile}
                    alt="Kid Profile"
                    className="kid-card__photo"
                  />
                  <div className="kid-card__details">
                    <p className="kid-card__username">{kid.username}</p>
                    <p className="kid-card__coins">0 Coins</p>
                  </div>
                </div>
                <div className="kid-card__actions">
                  <button className="kid-card__details-btn" onClick={() => this.showKidDetails()}>
                    Details
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

export default KidList;
