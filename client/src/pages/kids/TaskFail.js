import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import crying from '../../images/crying.png';
import leftArrow from "../../images/left-arrow.png";
import './TaskFail.css';

class TaskFail extends Component {
    render() {
        const { taskPrice, username } = this.props.location.state || { taskPrice: 0, username: '' };

        return (
            <div className="task-fail-page">
                <div className="task_title_bar">
                    <Link to="/kidTasks" className="task__back_arrow">
                        <img src={leftArrow} alt="" />
                    </Link>
                    <label className="task_title_bar_center_title">{username}</label>
                </div>
                <div className="task-fail-section">
                    <img src={crying} alt="" className="task-fail-image" style={{width: '90%', height: 'auto', backgroundColor: 'white'}}/>
                    <p className="task-fail-text"> {taskPrice} COINS LOST!!!</p>
                </div>
                <Link to="/kidTasks" className="task-fail-back-button">Back to Tasks</Link>
            </div>
        );
    }
}

export default TaskFail;
