import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import profile from "../../images/user.png";
import removeBtn from "../../images/remove.png";
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
    try {
      let result = await axios.get("/api/kids");
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

  async handleDeleteKid(kidId) {
    // Display a confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this kid?");
    if (!confirmDelete) {
      return; 
    }

    try {
      await axios.delete(`/api/kid/${kidId}`);
      this.loadData(); // Reload data after deleting
      notification.success({
        message: "Kid deleted successfully!",
        title: "",
      });
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }
  
  showKidDetails(id) {
    this.props.history.push({
        pathname: `/kidDetails/${id}`,
        state: { kidId: id } 
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
                <button className="kid-item__remove-from-list" onClick={() => this.handleDeleteKid(kid._id)}>
                  <img src={removeBtn} alt="Remove" className="kid-remove-btn__image" />
                </button>
                <div className="kid-card__content">                    
                  <div className="kid-card__photo-wrapper">
                    {kid.profilePicture ? (
                      <img
                        className="kid-card__photo"
                        src={kid.profilePicture}
                        alt="Kid Profile"
                      />
                    ) : (
                      <img src={profile} alt="Default Profile" className="kid-card__photo" />
                    )}
                  </div>
                  <div className="kid-card__details">
                    <p className="kid-card__username">{kid.username}</p>
                    <p className="kid-card__coins">{kid.wallet} Coins</p>
                  </div>
                </div>
                <div className="kid-card__actions">
                  <button
                    className="kid-card__details-btn"
                    onClick={() => this.showKidDetails(kid._id)}
                  >
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
