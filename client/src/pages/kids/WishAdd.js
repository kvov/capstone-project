import React, { Component } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { notification } from 'antd';
import leftArrow from "../../images/left-arrow.png";
import './WishAdd.css';

class WishAdd extends Component {
    state = {
        wishDescription: '',
        wishCost: '',
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleWishSave = async () => {
        if (!this.validateInputs()) {
            // Early exit if inputs are invalid
            return;
        }

        const { wishDescription, wishCost } = this.state;

        try {
            // Log the wish data being sent to the server
            console.log("Submitting wish data:", {
                kid: window.localStorage.id,
                wishDescription,
                wishCost,
            });

            const result = await axios.post('/api/wish', {
                kid: window.localStorage.id,
                wishDescription,  
                wishCost,         
            });

            // Log the successful result and the wish ID
            console.log("Wish saved successfully:", result.data);
            console.log("Wish ID:", result.data.data._id);

            notification.success({
                message: "Wish added successfully",
                title: "Success",
            });

            // Redirect to the wish list after a delay
            setTimeout(() => {
                this.props.history.push('/wishList');
            }, 2000);


        } catch (error) {
            // Enhanced error handling with optional fallback message
            console.error("Error saving wish:", error);
            notification.error({
                message: error.response?.data?.msg || 'An error occurred while adding the wish.',
                title: 'Error',
            });
        }
    };

    validateInputs() {
        const { wishDescription, wishCost } = this.state;
        if (!wishDescription || !wishCost) {
            notification.error({
                message: 'All fields are required.',
                title: 'Validation Error',
            });
            return false;
        }

        if (isNaN(wishCost) || wishCost <= 0) {
            notification.error({
                message: 'Wish cost must be a positive number.',
                title: 'Validation Error',
            });
            return false;
        }

        return true;
    }

    render() {
        const { wishDescription, wishCost } = this.state;
        return (
            <div className="wish-add-page">
                <div className="wish-add__title-bar">
                    <Link to="/wishList" className="wish-add__back-arrow">
                        <img src={leftArrow} alt="Back" />
                    </Link>
                    <label className="wish-add-title-bar__center-title">
                        {window.localStorage.username}
                    </label>
                    <label className="wish_list_add"></label>
                </div>
                <div className="wish-add-page__title">Add Wish</div>
                <div className="wish_add_form">
                    <div>
                        <input
                            value={wishDescription}
                            type="text"
                            className="wish_add_item"
                            name="wishDescription"
                            placeholder="Wish Description"
                            onChange={this.handleChange}
                        />
                    </div>
                    <div>
                        <input
                            value={wishCost}
                            type="number"
                            className="wish_add_item"
                            name="wishCost"
                            placeholder="Wish Cost"
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="wish_add_buttons">
                        <button
                            className="wish_add_save"
                            onClick={this.handleWishSave}
                        >
                            Save
                        </button>
                        <button
                            className="wish_add_cancel"
                            onClick={() => this.props.history.push('/wishList')}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
}

export default WishAdd;
