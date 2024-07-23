import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import happy from '../../images/star-thumbup.png';
import Navbar from '../../components/Navbar';
import './TaskSuccess.css';

class TaskSuccess extends Component {
    render() {
        const { taskPrice, username } = this.props.location.state || { taskPrice: 0, username: '' };

        return (
            <div className="task-success-page">
                <Navbar username={username} />
                <div className="task-success-section">
                    <img src={happy} alt="" className="task-success-image"/>
                    <p className="task-success-text"> GREAT JOB!!! <br /> YOU WILL EARN <br />{taskPrice} COINS<br /> WHEN YOUR PARENT CONFIRMS THE TASK COMPLETION!!!</p>
                </div>
                <Link to="/kidTasks" className="task-success-back-button">Back to Tasks</Link>
            </div>
        );
    }
}

export default TaskSuccess;
