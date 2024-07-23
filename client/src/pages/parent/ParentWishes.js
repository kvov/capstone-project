import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Wallet from "../../components/Wallet";
import "./ParentWishes.css";
import leftArrow from "../../images/left-arrow.png";
import finishedImg from "../../images/tick.png";
import waitingImg from "../../images/waiting.png";
import { notification } from "antd";
import Lottie from "lottie-react-web";
import animation from "../../fireworks.json";
import Navbar from "../../components/Navbar";

class ParentWishList extends Component {
  constructor(props) {
    super(props);
    let localStorage = window.localStorage;
    this.state = {
      username: localStorage.username,
      wishes: [],
      congratsModalIsOpen: false,
    };
  }

  componentDidMount() {
    let localStorage = window.localStorage;
    if (localStorage.islogin !== "1") {
      this.props.history.replace("/login");
    }
    this.loadWishes();
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  async loadWishes() {
    try {
      let result = await axios.get(`/api/parentWishes/`);
      this.setState({
        wishes: result.data.data,
      });
      console.log("reuslt: " + JSON.stringify(result.data.data));
    } catch (e) {
      console.log("reuslt: " + e.message);
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }

  render() {
    const { username, wishes, congratsModalIsOpen } = this.state;
    return (
      <div className="wish-page">
        <Navbar username={username} />
        <div className="page-title">Manage Wishes</div>

        <div className="wish-page__task-list-div">
          <div className="wish-page__task-list">
            {wishes.map((wish) => (
              <div className="wish-card" key={wish._id}>
                <div className="wish-card__content">
                  <p className="wish-card__description">
                    {wish.wishDescription}
                  </p>
                  <p className="wish-card__details">
                    {wish.wishCost} coins |{" "}
                    {wish.isFulfilled ? "Fulfilled" : "Pending"}
                  </p>
                </div>
                <div className="wish-card__actions">
                  {wish.isFulfilled ? (
                    <div className="wish-card__action-item">
                      <div className="wish-item__execute-wish-btn">
                        <img
                          src={finishedImg}
                          alt="Completed"
                          className="execute-wish-btn__image"
                        />
                      </div>
                      <span className="wish-btn-label">Completed</span>
                    </div>
                  ) : (
                    <div className="wish-card__action-item">
                      <div className="wish-item__execute-wish-btn">
                        <img
                          src={waitingImg}
                          alt="Execute"
                          className="execute-wish-btn__image"
                        />
                      </div>
                      <span className="wish-btn-label">On The Way</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default ParentWishList;
