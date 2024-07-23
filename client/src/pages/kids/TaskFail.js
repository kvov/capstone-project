import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import crying from '../../images/crying.png';
import Navbar from '../../components/Navbar';
import './TaskFail.css';

class TaskFail extends Component {
    render() {
        const { taskPrice, username } = this.props.location.state || { taskPrice: 0, username: '' };

        return (
            <div className="task-fail-page">
                <Navbar username={username} />
                <div className="task-fail-section">
                    <img src={crying} alt="" className="task-fail-image" style={{width: '90%', height: 'auto', backgroundColor: 'white'}}/>
                    <p className="task-fail-text"> YOU LOST A CHANCE TO EARN {taskPrice} COINS!!!</p>
                </div>
                <Link to="/kidTasks" className="task-fail-back-button">Back to Tasks</Link>
            </div>
        );
    }
}

export default TaskFail;
