import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../style.css";
import "./TaskAdd.css";
import Navbar from "../../components/Navbar";
import { notification } from "antd";

class TaskAdd extends Component {
  state = {
    taskDescription: "",
    taskCost: "",
    dueDate: "",
    kid: "",
    kids: [],
    recurrence: {
      frequency: "",
      interval: 1,
      daysOfWeek: [],
    },
    selectedDays: [],
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
    const { taskDescription, taskCost, dueDate, kid, recurrence } = this.state;

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

    if (recurrence.frequency && !recurrence.daysOfWeek.length) {
      notification.error({
        message: "Please select days of the week for recurring tasks",
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

    const { taskDescription, taskCost, dueDate, kid, recurrence } = this.state;
    try {
      const result = await axios.post("/api/task", {
        parent: window.localStorage.id,
        kid,
        taskDescription,
        taskCost,
        dueDate,
        recurrence,
      });

      console.log("Task saved successfully:", result.data);
      console.log("Task ID:", result.data.data._id);

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

  handleRecurrenceChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      recurrence: {
        ...prevState.recurrence,
        [name]: value,
      },
    }));
  };

  handleDaySelection = (day) => {
    this.setState((prevState) => {
      const { daysOfWeek } = prevState.recurrence;
      const newDaysOfWeek = daysOfWeek.includes(day)
        ? daysOfWeek.filter((d) => d !== day)
        : [...daysOfWeek, day];
      return {
        recurrence: {
          ...prevState.recurrence,
          daysOfWeek: newDaysOfWeek,
        },
        selectedDays: newDaysOfWeek,
      };
    });
  };

  render() {
    const { taskDescription, taskCost, dueDate, kid, kids, recurrence, selectedDays } = this.state;
    return (
      <div className="task-add-page">
        <Navbar username={window.localStorage.username} />
        <div className="page-title">Add Task</div>
        <div className="task_add_form">
          <div className="task_add_form__inner">
            <input
              value={taskDescription}
              type="text"
              className="task_add_item"
              placeholder="Task Description"
              onChange={(e) => {
                this.setState({ taskDescription: e.target.value });
              }}
            />
          
            <input
              value={taskCost}
              type="number"
              className="task_add_item"
              placeholder="Task Cost"
              onChange={(e) => {
                this.setState({ taskCost: e.target.value });
              }}
            />
          
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
          
            <div className="recurrence-section">
              <label className="recurrence-label">
                Recurrence:
              </label> 
              <select className="task_add_item"
                name="frequency"
                value={recurrence.frequency}
                onChange={this.handleRecurrenceChange}
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              

              {recurrence.frequency === "weekly" && (
                <div className="days-of-week">
                  <label>Select Days of Week:</label>
                  <div className="days">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <label key={day}>
                        <input
                          type="checkbox"
                          checked={selectedDays.includes(day)}
                          onChange={() => this.handleDaySelection(day)}
                        />
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}
                      </label>
                    ))}
                  </div>
                </div>
              )}
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
      </div>
    );
  }
}

export default TaskAdd;
