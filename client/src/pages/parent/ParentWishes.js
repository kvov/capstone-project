import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Wallet from "../../components/Wallet";
import "./ParentWishes.css";
import leftArrow from "../../images/left-arrow.png";
import finishedImg from "../../images/completed.png";
import executeBtn from "../../images/tick.png";
import { notification } from "antd";
import Lottie from 'lottie-react-web';
import animation from '../../fireworks.json';

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
        } catch (e) {
            console.log("reuslt: " + e.message);
            notification.error({
                message: e.response.data.msg,
                title: "Error",
            });
        }
    }

    // Fulfill a specific wish
    async completeWish(wishId) {
        console.log("Executing wish with ID:", wishId);
        try {
            const kidId = window.localStorage.id;
            console.log("Kid ID:", kidId);
            await axios.post(`/api/wish/fulfill/${wishId}`);
            this.setState({ congratsModalIsOpen: true });
            this.loadWishes(kidId);
        } catch (e) {
            notification.error({
                message: e.response?.data?.msg || "Error fulfilling wish",
                title: "Error",
            });
        }
    }

    render() {
        const { username, wishes, congratsModalIsOpen } = this.state;
        return (
            <div className="wish-page">
                <div className="wish-title-bar">
                    <Link to="/" className="wish__back-arrow">
                        <img src={leftArrow} alt="" />
                    </Link>
                    <label className="wish-title-bar__center-title">{username}</label>
                </div>

                <div className="wish-page__title">Manage Wishes</div>

                <div className="wish-page__task-list-div">
                    <div className="wish-page__task-list">
                        {wishes.map((wish) => (
                            <div className="wish-card" key={wish._id}>
                                <div className="wish-card__content">
                                    <p className="wish-card__description">{wish.wishDescription}</p>
                                    <p className="wish-card__details">
                                        {wish.wishCost} coins | {wish.isFulfilled ? "Fulfilled" : "Pending"}
                                    </p>
                                </div>
                                <div className="wish-card__actions">
                                    {
                                        wish.isFulfilled ? (
                                            <div className="wish-card__action-item">
                                                <div className="wish-item__execute-wish-btn">
                                                    <img src={finishedImg} alt="Completed" className="execute-wish-btn__image" />
                                                </div>
                                                <span className="wish-btn-label">Completed</span>
                                            </div>
                                        ) : (
                                            <div className="wish-card__action-item">
                                                <button className="wish-item__execute-wish-btn" onClick={() => this.completeWish(wish._id)}>
                                                    <img src={executeBtn} alt="Execute" className="execute-wish-btn__image" />
                                                </button>
                                                <span className="wish-btn-label">Done</span>
                                            </div>
                                        )
                                    }
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
