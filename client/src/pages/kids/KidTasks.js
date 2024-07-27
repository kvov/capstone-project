import React, { Component } from "react";
import axios from "axios";
import { Link, withRouter } from "react-router-dom";
import "./KidTasks.css";
import Wallet from "../../components/Wallet";
import Navbar from "../../components/Navbar";
import execute from "../../images/angel.png";
import lose from "../../images/devil.png";
import { notification } from "antd";

class KidTasks extends Component {
  componentDidMount() {
    let localStorage = window.localStorage;
    if (localStorage.islogin !== "1") {
      this.props.history.replace("/login");
    }
    this.loadTasks(localStorage.id);
  }

  constructor(props) {
    super(props);
    let localStorage = window.localStorage;
    this.state = {
      username: localStorage.username,
      tasks: [],
    };
  }

  async loadTasks(id) {
    try {
      let result = await axios.get(`/api/kidTasks/${id}`);
      this.setState({
        tasks: result.data.data,
      });
      console.log("kid tasks: " + JSON.stringify(result.data.data));
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }


  executeTask(task) {
    const { username } = this.state;
    this.props.history.push({
      pathname: '/taskSuccess',
      state: { taskPrice: task.taskCost, username }
    });
  }

  loseTask(task) {
    const { username } = this.state;
    this.props.history.push({
      pathname: '/taskFail',
      state: { taskPrice: task.taskCost, username }
    });
  }

  renderRecurrence(recurrence) {
    if (!recurrence) return "";

    const { frequency, interval, daysOfWeek } = recurrence;
    const intervalText = interval === 1
      ? (frequency === 'daily' ? 'day' : 'week')
      : (frequency === 'daily' ? 'days' : 'weeks');

    let recurrenceText = `${frequency},<br />every ${interval} ${intervalText}`;
    
    if (daysOfWeek && daysOfWeek.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = daysOfWeek.map(day => dayNames[day]).join(", ");
      recurrenceText += `<br />on ${days}`;
    }

    return recurrenceText;
  }

  render() {
    const { username, tasks } = this.state;
    return (
      <div className="task-page">
        <Navbar username={username} />        
        <div className="page-title">Tasks</div>

        <Wallet />

        <div className="task-page__task-list-div">
          <div className="task-page__task-list">
            {tasks.map((task) => (
              <div className="task-card" key={task._id}>
                <div className="task-card__content">
                  <p className="task-card__description">{task.taskDescription}</p>
                  <p className="task-card__details">
                    {task.taskCost} coins | Due: {new Date(task.dueDate).toISOString().split('T')[0]} | Kid: {task.kid.username}
                  </p>
                  {this.renderRecurrence(task.recurrence) && (
                    <p className="task-card__details" dangerouslySetInnerHTML={{ __html: this.renderRecurrence(task.recurrence) }} />
                  )}
                </div>
                <div className="task-card__actions">
                  <div className="task-card__action-item">
                    <button className="task-item__execute-task-btn" onClick={() => this.executeTask(task)}>
                      <img src={execute} alt="Execute" className="execute-task-btn__image" />
                    </button>
                    <span className="task-btn-label done">Done</span>
                  </div>
                  <div className="task-card__action-item">
                    <button className="task-item__lose-task-btn" onClick={() => this.loseTask(task)}>
                      <img src={lose} alt="Lose" className="lose-task-btn__image" />
                    </button>
                    <span className="task-btn-label failed">Failed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(KidTasks);
