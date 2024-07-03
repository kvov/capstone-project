import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../style.css";
import "./TaskAdd.css";
import leftArrow from "../../images/left-arrow.png";
import { notification } from "antd";

class TaskAdd extends Component {
  state = {
    taskDescription: "",
    taskCost: "",
    dueDate: "",
    kid: "",
    kids: [],
  };

  async componentDidMount() {
    let localStorage = window.localStorage;
    if (localStorage.islogin !== "1") {
      this.props.history.replace("/login");
    }
    try {
      const result = await axios.get("/api/kids");
      this.setState({ kids: result.data.data });
    } catch (e) {
      notification.error({
        message: "Failed to load kids",
        title: "Error",
      });
    }
  }

  cancelTaskAdd = () => {
    this.props.history.replace("/tasks");
  };

  validateInputs = () => {
    const { taskDescription, taskCost, dueDate, kid } = this.state;

    if (!taskDescription || !taskCost || !dueDate || !kid) {
      notification.error({
        message: "All fields are required",
        title: "Error",
      });
      return false;
    }

    if (isNaN(taskCost) || taskCost <= 0) {
      notification.error({
        message: "Task cost must be a positive number",
        title: "Error",
      });
      return false;
    }

    const selectedDate = new Date(dueDate);
    const today = new Date();
    if (selectedDate <= today) {
      notification.error({
        message: "Due date must be in the future",
        title: "Error",
      });
      return false;
    }

    return true;
  };

  handleTaskSave = async () => {
    if (!this.validateInputs()) {
      return;
    }

    const { taskDescription, taskCost, dueDate, kid } = this.state;
    try {
      const result = await axios.post("/api/task", {
        parent: window.localStorage.id,
        kid,
        taskDescription,
        taskCost,
        dueDate,
      });

      notification.success({
        message: "Task added successfully",
        title: "Success",
      });

      setTimeout(() => {
        this.props.history.replace("/tasks");
      }, 2000);

      console.log("result:", result);
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  };

  render() {
    const { taskDescription, taskCost, dueDate, kid, kids } = this.state;
    return (
      <div className="task-add-page">
        <div className="task_title_bar">
          <Link to="/tasks" className="task__back_arrow">
            <img src={leftArrow} alt="" />
          </Link>
          <label className="task_title_bar_center_title">
            {window.localStorage.username}
          </label>
          <label className="task_list_add"></label>
        </div>
        <div className="task-add-page__title">Add Task</div>
        <div className="task_add_form">
          <div>
            <input
              value={taskDescription}
              type="text"
              className="task_add_item"
              placeholder="Task Description"
              onChange={(e) => {
                this.setState({ taskDescription: e.target.value });
              }}
            />
          </div>
          <div>
            <input
              value={taskCost}
              type="number"
              className="task_add_item"
              placeholder="Task Cost"
              onChange={(e) => {
                this.setState({ taskCost: e.target.value });
              }}
            />
          </div>
          <div>
            <input
              value={dueDate}
              type="date"
              className="task_add_item task_add_item__dob"
              placeholder="Due Date"
              min={new Date().toISOString().split("T")[0]} 
              onChange={(e) => {
                this.setState({ dueDate: e.target.value });
              }}
            />
          </div>
          <div>
            <select
              value={kid}
              className="task_add_item"
              onChange={(e) => {
                this.setState({ kid: e.target.value });
              }}
            >
              <option value="" disabled>Select Kid</option>
              {kids.map((kid) => (
                <option key={kid._id} value={kid._id}>
                  {kid.username}
                </option>
              ))}
            </select>
          </div>

          <div className="task_add_buttons">
            <button
              className="task_add_save "
              onClick={this.handleTaskSave}
            >
              Save
            </button>
            <button
              className="task_add_cancel "
              onClick={this.cancelTaskAdd}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default TaskAdd;
