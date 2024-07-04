import React, { Component } from "react";
import axios from "axios";
import { Link, withRouter } from "react-router-dom";
import "./KidTasks.css";
import Wallet from "../../components/Wallet";
import leftArrow from "../../images/left-arrow.png";
import removeBtn from "../../images/remove.png";
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
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }

  async deleteTask(taskId) {
    console.log("Deleting task with ID:", taskId);  
    try {
      await axios.delete(`/api/task/${taskId}`);
      notification.success({
        message: "Task deleted successfully",
        title: "Success",
      });
      this.loadTasks(window.localStorage.id); 
    } catch (e) {
      console.error("Error details:", e);  
      notification.error({
        message: e.response ? e.response.data.msg : 'Error deleting task',
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

  render() {
    const { username, tasks } = this.state;
    return (
      <div className="task-page">
        <div className="task_title_bar">
          <Link to="/" className="task__back_arrow">
            <img src={leftArrow} alt="" />
          </Link>
          <label className="task_title_bar_center_title">{username}</label>
        </div>
        
        <div className="task-page__title">Tasks</div>

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
                </div>
                <div className="task-card__actions">
                  <div className="task-card__action-item">
                    <button className="task-item__execute-task-btn" onClick={() => this.executeTask(task)}>
                      <img src={execute} alt="Execute" className="execute-task-btn__image" />
                    </button>
                    <span className="task-btn-label">Done</span>
                  </div>
                  <div className="task-card__action-item">
                    <button className="task-item__lose-task-btn" onClick={() => this.loseTask(task)}>
                      <img src={lose} alt="Lose" className="lose-task-btn__image" />
                    </button>
                    <span className="task-btn-label">Failed</span>
                  </div>
                  {/* <div className="task-card__action-item">
                    <button className="task-item__remove-from-list" onClick={() => this.deleteTask(task._id)}>
                      <img src={removeBtn} alt="Remove" className="task-remove-btn__image" />
                    </button>
                    <span className="task-btn-label">Delete</span>
                  </div> */}
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
