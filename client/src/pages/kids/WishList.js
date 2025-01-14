import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Wallet from "../../components/Wallet";
import "./WishList.css";
import Navbar from "../../components/Navbar";
import removeBtn from "../../images/remove.png";
import executeBtn from "../../images/tick.png";
import { notification } from "antd";
import Lottie from "lottie-react-web";
import animation from "../../fireworks.json";
import dayjs from "dayjs";

class WishList extends Component {
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
    this.loadWishes(localStorage.id);
    this.loadWallet(localStorage.id);
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  async loadWallet(id) {
    try {
      let result = await axios.get(`/api/kidWallet/${id}`);
      this.setState({
        wallet: result.data.wallet,
      });
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }

  async loadWishes(id) {
    try {
      let result = await axios.get(`/api/kidWishes/${id}`);
      this.setState({
        wishes: result.data.data.sort((a, b) =>
          dayjs(a.createTime).diff(dayjs(b.createTime))
        ),
      });
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }

  // Delete a specific wish
  async deleteWish(wishId) {
    try {
      const kidId = window.localStorage.id;
      await axios.delete(`/api/wish/${wishId}`, {
        data: { kid: kidId },
      });
      notification.success({
        message: "Wish removed successfully",
        title: "Success",
      });
      this.loadWishes(kidId);
    } catch (e) {
      notification.error({
        message: e.response?.data?.msg || "Error removing wish",
        title: "Error",
      });
    }
  }

  async executeWish(wishId) {
    try {
      const kidId = window.localStorage.id;
      const response = await axios.put(`/api/wish/fulfill/${wishId}`, { kid: kidId });
      
      if (response.data.msg === "Wish fulfilled successfully") {
        await this.loadWallet(kidId);
        this.setState({ congratsModalIsOpen: true });
      } else {
        notification.error({
          message: response.data.msg,
          title: "Error",
        });
      }
      
      this.loadWishes(kidId);
    } catch (e) {
      notification.error({
        message: e.response?.data?.msg || "Error fulfilling wish",
        title: "Error",
      });
    }
  }
  

  render() {
    const { username, wishes, congratsModalIsOpen, wallet } = this.state;
    return (
      <div className="wish-page">
        <Navbar username={username} />

      <div className="content-page">
        <div className="page-title">Manage Wishes</div>

        <Wallet wallet={wallet} />

        {congratsModalIsOpen ? (
          <div className="congrats-modal">
            <Lottie
              options={{
                animationData: animation,
                loop: false,
              }}
            />
            <p className="congrats-modal__text">
              YOUR WISH'S <br />
              COME TRUE!!!
            </p>
            <button
              className="style_common_button style_common_button_purple congrats-modal__close-btn"
              onClick={() => this.setState({ congratsModalIsOpen: false })}
            >
              Close
            </button>
          </div>
        ) : null}

        <div className="wish-page__add-wish-button-div">
          <Link to="/wishadd" className="wish-page__add-wish-button">
            Add Wish
          </Link>
        </div>

        <div className="wish-page__wish-list-div">
          <div className="wish-page__wish-list">
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
                  {!wish.isFulfilled && (
                    <div className="wish-card__action-item">
                      <button
                        className="wish-item__execute-wish-btn"
                        onClick={() => this.executeWish(wish._id)}
                      >
                        <img
                          src={executeBtn}
                          alt="Execute"
                          className="execute-wish-btn__image"
                        />
                      </button>
                      <span className="wish-btn-label done">Done</span>
                    </div>
                  )}
                  <div className="wish-card__action-item">
                    <button
                      className="wish-item__remove-from-list"
                      onClick={() => this.deleteWish(wish._id)}
                    >
                      <img
                        src={removeBtn}
                        alt="Remove"
                        className="remove-btn__image"
                      />
                    </button>
                    <span className="wish-btn-label delete">Delete</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    );
  }
}

export default WishList;
