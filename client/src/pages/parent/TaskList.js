import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import moment from "moment-timezone";
import "./TaskList.css";
import Navbar from "../../components/Navbar";
import removeBtn from "../../images/remove.png";
import updateBtn from "../../images/edit-tools.png";
import saveBtn from "../../images/save.png";
import execute from "../../images/angel.png";
import { notification } from "antd";

class TaskList extends Component {
  constructor(props) {
    super(props);
    let localStorage = window.localStorage;
    this.state = {
      username: localStorage.username,
      tasks: [],
      editingTaskId: null,
      taskToUpdate: null,
    };
  }

  componentDidMount() {
    let localStorage = window.localStorage;
    if (localStorage.islogin !== "1") {
      this.props.history.replace("/login");
    }
    this.loadTasks();
  }

  async loadTasks() {
    try {
      let result = await axios.get("/api/tasks");
      const tasks = result.data.data;

      const filteredTasks = tasks.reduce((acc, task) => {
        // Filter for recurring tasks and update with nearest due date
        if (task.recurrence) {
          let nextDueDate = moment(task.dueDate);

          if (task.recurrence.frequency === "daily") {
            while (nextDueDate.isBefore(moment().startOf("day"))) {
              nextDueDate.add(1, "days");
            }
          } else if (task.recurrence.frequency === "weekly") {
            while (nextDueDate.isBefore(moment().startOf("day"))) {
              nextDueDate.add(1, "weeks");
            }
          } else if (task.recurrence.frequency === "monthly") {
            while (nextDueDate.isBefore(moment().startOf("day"))) {
              nextDueDate.add(1, "months");
            }
          }

          task.dueDate = nextDueDate.toDate();
        }

        // Only add task if it is not already in the list or if it has an earlier due date
        const existingTaskIndex = acc.findIndex(
          (t) => t.taskDescription === task.taskDescription
        );

        if (
          existingTaskIndex === -1 ||
          moment(task.dueDate).isBefore(moment(acc[existingTaskIndex].dueDate))
        ) {
          if (existingTaskIndex !== -1) {
            acc[existingTaskIndex] = task;
          } else {
            acc.push(task);
          }
        }

        return acc;
      }, []);

      this.setState({ tasks: filteredTasks });
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }

  async deleteTask(taskId) {
    try {
      await axios.delete(`/api/task/${taskId}`);
      notification.success({
        message: "Task deleted successfully",
        title: "Success",
      });
      this.loadTasks();
    } catch (e) {
      notification.error({
        message: e.response ? e.response.data.msg : "Error deleting task",
        title: "Error",
      });
    }
  }

  async confirmTask(task) {
    try {
      const { _id, recurrence, taskCost } = task;
      await axios.put(`/api/task/confirm/${_id}`, {
        kidId: task.kid._id,
        recurrence,
        taskCost,
      });

      notification.success({
        message: "Task confirmed successfully",
        title: "Success",
      });

      this.loadTasks();
    } catch (e) {
      notification.error({
        message: e.response ? e.response.data.message : "Error confirming task",
        title: "Error",
      });
    }
  }

  async updateTask() {
    console.log("Updating task with data:", this.state.taskToUpdate);
    const { taskToUpdate } = this.state;
    try {
      await axios.put(`/api/task/${taskToUpdate._id}`, taskToUpdate);
      notification.success({
        message: "Task updated successfully",
        title: "Success",
      });
      this.setState({ editingTaskId: null, taskToUpdate: null });
      this.loadTasks();
    } catch (e) {
      notification.error({
        message: e.response ? e.response.data.message : "Error updating task",
        title: "Error",
      });
    }
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      taskToUpdate: {
        ...prevState.taskToUpdate,
        [name]: value,
      },
    }));
  }

  handleStatusChange = (e) => {
    const { value } = e.target;
    this.setState((prevState) => ({
      taskToUpdate: {
        ...prevState.taskToUpdate,
        taskStatus: value,
      },
    }));
  };

  startEditing(task) {
    this.setState({
      editingTaskId: task._id,
      taskToUpdate: { ...task },
    });
  }

  renderRecurrence(recurrence) {
    if (!recurrence) return "";

    const { frequency, daysOfWeek } = recurrence;
    let recurrenceText = frequency ? `${frequency}` : "";

    if (daysOfWeek && daysOfWeek.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = daysOfWeek.map((day) => dayNames[day]).join(", ");
      recurrenceText += `<br />on ${days}`;
    }

    return recurrenceText;
  }

  handleRecurrenceChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      taskToUpdate: {
        ...prevState.taskToUpdate,
        recurrence: {
          ...prevState.taskToUpdate.recurrence,
          [name]: value,
        },
      },
    }));
  };

  handleDaySelection = (day) => {
    this.setState((prevState) => {
      const selectedDays = prevState.taskToUpdate.recurrence.daysOfWeek || [];
      const newSelectedDays = selectedDays.includes(day)
        ? selectedDays.filter((d) => d !== day)
        : [...selectedDays, day];

      return {
        taskToUpdate: {
          ...prevState.taskToUpdate,
          recurrence: {
            ...prevState.taskToUpdate.recurrence,
            daysOfWeek: newSelectedDays,
          },
        },
      };
    });
  };

  formatDate(date) {
    return moment(date).tz("America/Toronto").format("YYYY-MM-DD");
  }

  isDueSoon(dueDate) {
    const now = moment.tz("America/Toronto");
    const taskDueDate = moment(dueDate).tz("America/Toronto");
    const endOfDay = now.clone().add(24, "hours");
    return (
      taskDueDate.isBefore(endOfDay) &&
      taskDueDate.isSameOrAfter(now.clone().subtract(1, "days"))
    );
  }

  render() {
    const { username, tasks, editingTaskId, taskToUpdate } = this.state;
    return (
      <div className="task-page">
        <Navbar username={username} />

        <div className="page-title">Manage Tasks</div>

        <div className="task-page__add-task-button-div">
          <Link to="/taskadd" className="task-page__add-task-button">
            Add Task
          </Link>
        </div>

        <div className="task-page__task-list-div">
          <div className="task-page__task-list">
            {tasks.map((task) => (
              <div
                className={`task-card ${
                  this.isDueSoon(task.dueDate) ? "task-card__due-soon" : ""
                }`}
                key={task._id}
              >
                <div className="task-card__content">
                  {editingTaskId === task._id ? (
                    <div className="container">
                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Description:</label>
                          <input
                            className="form-control"
                            type="text"
                            name="taskDescription"
                            value={taskToUpdate.taskDescription}
                            onChange={(e) => this.handleInputChange(e)}
                          />
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Cost:</label>
                          <input
                            className="form-control"
                            type="number"
                            name="taskCost"
                            value={taskToUpdate.taskCost}
                            onChange={(e) => this.handleInputChange(e)}
                          />
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Due Date:</label>
                          <input
                            className="form-control"
                            type="date"
                            name="dueDate"
                            value={this.formatDate(taskToUpdate.dueDate)}
                            onChange={(e) => this.handleInputChange(e)}
                          />
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Status:</label>
                          <select
                            className="form-select"
                            name="taskStatus"
                            value={taskToUpdate.taskStatus || "new"}
                            onChange={this.handleStatusChange}
                          >
                            <option value="new">New</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="expired">Expired</option>
                            <option value="failed">Failed</option>
                            <option value="pending approval">
                              Pending Approval
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Recurrence:</label>
                          <select
                            className="form-select"
                            name="frequency"
                            value={taskToUpdate.recurrence.frequency || ""}
                            onChange={(e) => this.handleRecurrenceChange(e)}
                          >
                            <option value="">None</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>

                          {taskToUpdate.recurrence.frequency === "weekly" && (
                            <div className="mt-3">
                              <label className="form-label">
                                Select Days of Week:
                              </label>
                              <div>
                                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                  <div key={day} className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={taskToUpdate.recurrence.daysOfWeek.includes(
                                        day
                                      )}
                                      onChange={() =>
                                        this.handleDaySelection(day)
                                      }
                                    />
                                    <label className="form-check-label">
                                      {
                                        [
                                          "Sun",
                                          "Mon",
                                          "Tue",
                                          "Wed",
                                          "Thu",
                                          "Fri",
                                          "Sat",
                                        ][day]
                                      }
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="task-card__actions">
                        <div className="task-card__action-item">
                          <button
                            className="task-item__update-task-btn"
                            onClick={() => this.updateTask()}
                          >
                            <img
                              src={saveBtn}
                              alt="Update"
                              className="update-task-btn__image"
                            />
                          </button>
                          <span className="task-btn-label update">Save</span>
                        </div>
                        <div className="task-card__action-item">
                          <button
                            className="task-item__remove-from-list"
                            onClick={() =>
                              this.setState({
                                editingTaskId: null,
                                taskToUpdate: null,
                              })
                            }
                          >
                            <img
                              src={removeBtn}
                              alt="Remove"
                              className="task-remove-btn__image"
                            />
                          </button>
                          <span className="task-btn-label delete">Cancel</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="task-card__description">
                        {task.taskDescription}
                      </p>
                      <p className="task-card__details">
                        Kid: {task.kid?.username}
                      </p>
                      <p className="task-card__details">
                        Cost: {task.taskCost} coins
                      </p>
                      <p className="task-card__details">
                        Status: {task.taskStatus}
                      </p>
                      <p className="task-card__details">
                        Due: {this.formatDate(task.dueDate)}
                      </p>
                      <p className="task-card__details">
                        {this.renderRecurrence(task.recurrence) ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: `Recurrence: ${this.renderRecurrence(
                                task.recurrence
                              )}`,
                            }}
                          />
                        ) : (
                          ""
                        )}
                      </p>
                      <div className="task-card__actions">
                        <div className="task-card__action-item">
                          <button
                            className="task-item__execute-task-btn"
                            onClick={() => this.confirmTask(task)}
                          >
                            <img
                              src={execute}
                              alt="Execute"
                              className="execute-task-btn__image"
                            />
                          </button>
                          <span className="task-btn-label done">Confirm</span>
                        </div>

                        <div className="task-card__action-item">
                          <button
                            className="task-item__update-task-btn"
                            onClick={() => this.startEditing(task)}
                          >
                            <img
                              src={updateBtn}
                              alt="Update"
                              className="update-task-btn__image"
                            />
                          </button>
                          <span className="task-btn-label update">Update</span>
                        </div>
                        <div className="task-card__action-item">
                          <button
                            className="task-item__remove-from-list"
                            onClick={() => this.deleteTask(task._id)}
                          >
                            <img
                              src={removeBtn}
                              alt="Remove"
                              className="task-remove-btn__image"
                            />
                          </button>
                          <span className="task-btn-label delete">Delete</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default TaskList;
