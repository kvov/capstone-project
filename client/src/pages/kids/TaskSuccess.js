import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import happy from '../../images/star-thumbup.png';
import leftArrow from "../../images/left-arrow.png";
import './TaskSuccess.css';

class TaskSuccess extends Component {
    render() {
        const { taskPrice, username } = this.props.location.state || { taskPrice: 0, username: '' };

        return (
            <div className="task-success-page">
                <div className="task_title_bar">
                    <Link to="/kidTasks" className="task__back_arrow">
                        <img src={leftArrow} alt="" />
                    </Link>
                    <label className="task_title_bar_center_title">{username}</label>
                </div>
                <div className="task-success-section">
                    <img src={happy} alt="" className="task-success-image" style={{width: '90%', height: 'auto', backgroundColor: 'white'}}/>
                    <p className="task-success-text"> GREAT JOB!!! <br /> YOU WILL EARN <br />{taskPrice} COINS<br /> WHEN YOUR PARENT CONFIRMS THE TASK COMPLETION!!!</p>
                </div>
                <Link to="/kidTasks" className="task-success-back-button">Back to Tasks</Link>
            </div>
        );
    }
}

export default TaskSuccess;
