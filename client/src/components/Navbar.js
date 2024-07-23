import React, { useState } from "react";
import { Link, withRouter } from "react-router-dom";
import leftArrow from "../images/left-arrow.png";
import "./Navbar.css";

const Navbar = ({ username, history }) => {
    
    const handleBackClick = () => {
        history.goBack();
    };

    return (
        <div className="navbar">
            <div className="navbar__back-arrow" onClick={handleBackClick}>
                <img src={leftArrow} alt="Back" className="navbar__back-arrow-img" />
            </div>
            <div className="navbar__title-container">
                <div className="navbar__title">{username}</div>
            </div>
        </div>
    );
};

export default withRouter(Navbar);
