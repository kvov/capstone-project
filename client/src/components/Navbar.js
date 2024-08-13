import React, { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import leftArrow from "../images/left-arrow.png";
import "./Navbar.css";

const Navbar = ({ username }) => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const history = useHistory();
    const role = localStorage.getItem("role"); 

    const handleBackClick = () => {
        history.goBack(); 
    };

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <header className="navigation ">
            <nav className="navbar navbar-expand-lg navbar-dark">
                <div className="navbar__back-arrow" onClick={handleBackClick}>
                    <img src={leftArrow} alt="Back" className="navbar__back-arrow-img" />
                </div>
                <div className="navbar__title-container">
                    <div className="navbar__title">{username}</div>
                </div>

                <button className="navbar-toggler" type="button" onClick={toggleNav}
                    aria-controls="navigation" aria-expanded={isNavOpen} aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`navbar__nav-links collapse navbar-collapse text-center ${isNavOpen ? 'show' : ''}`} id="navigation">
                    <ul className="navbar-nav ms-auto">
                        {role === "kid" && (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/" exact className="nav-link" activeClassName="active">Home</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/wishList" className="nav-link" activeClassName="active">Wishes</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/kidTasks" className="nav-link" activeClassName="active">Tasks</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/notifications" className="nav-link" activeClassName="active">Messages</NavLink>
                                </li>
                            </>
                        )}
                        {role === "parent" && (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/" exact className="nav-link" activeClassName="active">Home</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/parentWishes" className="nav-link" activeClassName="active">Wishes</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/tasks" className="nav-link" activeClassName="active">Tasks</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/kids" className="nav-link" activeClassName="active">Kids</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/notifications" className="nav-link" activeClassName="active">Messages</NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
