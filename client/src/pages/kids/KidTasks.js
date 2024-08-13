import React, { Component } from "react";
import axios from "axios";
import { Link, withRouter } from "react-router-dom";
import "./KidTasks.css";
import Wallet from "../../components/Wallet";
import Navbar from "../../components/Navbar";
import execute from "../../images/angel.png";
import lose from "../../images/devil.png";
import { notification } from "antd";
import moment from 'moment';

class KidTasks extends Component {
  componentDidMount() {
    let localStorage = window.localStorage;
    if (localStorage.islogin !== "1") {
      this.props.history.replace("/login");
    }
    this.loadTasks(localStorage.id);
    this.loadWallet(localStorage.id);
  }

  constructor(props) {
    super(props);
    let localStorage = window.localStorage;
    this.state = {
      username: localStorage.username,
      tasks: [],
      wallet: 0,
    };
  }

  async loadTasks(id) {
    try {
      // Fetch tasks from the API
      let result = await axios.get(`/api/kidTasks/${id}`);
      let tasks = result.data.data;
  
      // Process the tasks to filter and update recurring tasks
      const filteredTasks = tasks.reduce((acc, task) => {
        // Update recurring tasks with the nearest due date
        if (task.recurrence) {
          let nextDueDate = moment(task.dueDate);
  
          if (task.recurrence.frequency === 'daily') {
            while (nextDueDate.isBefore(moment().startOf('day'))) {
              nextDueDate.add(1, 'days');
            }
          } else if (task.recurrence.frequency === 'weekly') {
            while (nextDueDate.isBefore(moment().startOf('day'))) {
              nextDueDate.add(1, 'weeks');
            }
          } else if (task.recurrence.frequency === 'monthly') {
            while (nextDueDate.isBefore(moment().startOf('day'))) {
              nextDueDate.add(1, 'months');
            }
          }
  
          task.dueDate = nextDueDate.toDate();
        }
  
        // Only add task if it is not already in the list or if it has an earlier due date
        const existingTaskIndex = acc.findIndex(t => t.taskDescription === task.taskDescription);
  
        if (existingTaskIndex === -1 || moment(task.dueDate).isBefore(moment(acc[existingTaskIndex].dueDate))) {
          if (existingTaskIndex !== -1) {
            acc[existingTaskIndex] = task;
          } else {
            acc.push(task);
          }
        }
  
        return acc;
      }, []);
  
      // Update state with filtered tasks
      this.setState({
        tasks: filteredTasks,
      });
    } catch (e) {
      notification.error({
        message: e.response.data.msg,
        title: "Error",
      });
    }
  }
  

  async loadWallet(id) {
    try {
      let result = await axios.get(`/api/kidWallet/${id}`);
      this.setState({
        wallet: result.data.wallet,
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
      this.loadTasks(); 
    } catch (e) {
      console.error("Error details:", e);  
      notification.error({
        message: e.response ? e.response.data.msg : 'Error deleting task',
        title: "Error",
      });
    }
  }

  async completeTask(taskId) {
    console.log("Completing task with ID:", taskId);
    try {
      const response = await axios.put(`/api/task/complete/${taskId}`);
      notification.success({
        message: "Task completed successfully",
        title: "Success",
      });
      await this.loadTasks(window.localStorage.id);
      
      this.props.history.push({
        pathname: '/taskSuccess',
        state: { taskCost: response.data.taskCost, username: this.state.username }
      });

    } catch (error) {
      console.error("Error completing task:", error.response?.data?.msg || error.message);
      notification.error({
        message: error.response?.data?.msg || "Error completing task",
        title: "Error",
      });
    }
  }

  async loseTask(taskId) {
    try {
      const response = await axios.put(`/api/task/fail/${taskId}`);
      notification.success({
        message: "Failed to complete the task",
        title: "Failure",
      });
      await this.loadTasks(window.localStorage.id);
      
      this.props.history.push({
        pathname: '/taskFail',
        state: { taskCost: response.data.taskCost, username: this.state.username }
      });

    } catch (error) {
      console.error("Error failing task:", error.response?.data?.msg || error.message);
      notification.error({
        message: error.response?.data?.msg || "Error",
        title: "Error",
      });
    }
  }

  isDueSoon(dueDate) {
    const now = moment.tz('America/Toronto');
    const taskDueDate = moment(dueDate).tz('America/Toronto');
    
    // Debugging logs
    console.log('Now:', now.format());
    console.log('Task Due Date:', taskDueDate.format());
    
    // Calculate the end of the day in 'America/Toronto' timezone
    const endOfDay = now.clone().add(24, 'hours');
  
    // Check if dueDate is overdue or due within the next 24 hours
    return taskDueDate.isBefore(endOfDay) && taskDueDate.isSameOrAfter(now.clone().subtract(1, 'days'));
  }

  renderRecurrence(recurrence) {
    if (!recurrence) return "";

    const { frequency, daysOfWeek } = recurrence;

    let recurrenceText = `${frequency}`;
    
    if (daysOfWeek && daysOfWeek.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = daysOfWeek.map(day => dayNames[day]).join(", ");
      recurrenceText += `<br />on ${days}`;
    }

    return recurrenceText;
  }

  render() {
    const { username, tasks, wallet } = this.state;
    return (
      <div className="task-page">
        <Navbar username={username} />        
        <div className="page-title">Tasks</div>

        <Wallet wallet={wallet} />

        <div className="task-page__task-list-div">
          <div className="task-page__task-list">
            {tasks.map((task) => (
              <div
                className={`task-card ${this.isDueSoon(task.dueDate) ? 'task-card__due-soon' : ''}`}
                key={task._id}
              >
                <div className="task-card__content">
                  <p className="task-card__description">{task.taskDescription}</p>
                  <p className="task-card__details">Status: {task.taskStatus}</p>
                  <p className="task-card__details">Cost: {task.taskCost} coins</p>
                  <p className="task-card__details"> Due: {new Date(task.dueDate).toISOString().split('T')[0]} </p>
                  {this.renderRecurrence(task.recurrence) && (
                    <p className="task-card__details" dangerouslySetInnerHTML={{ __html: this.renderRecurrence(task.recurrence) }} />
                  )}
                </div>
                <div className="task-card__actions">
                  {task.taskStatus !== 'failed' && task.taskStatus !== 'completed' && task.taskStatus !== 'pending approval' && (
                    <div className="task-card__action-item">
                      <button className="task-item__execute-task-btn" onClick={() => this.completeTask(task._id)}>
                        <img src={execute} alt="Execute" className="execute-task-btn__image" />
                      </button>
                      <span className="task-btn-label done">Done</span>
                    </div>
                  )}
                  {task.taskStatus !== 'completed' && task.taskStatus !== 'pending approval' && (
                    <div className="task-card__action-item">
                      <button className="task-item__lose-task-btn" onClick={() => this.loseTask(task._id)}>
                        <img src={lose} alt="Lose" className="lose-task-btn__image" />
                      </button>
                      <span className="task-btn-label failed">Failed</span>
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

export default withRouter(KidTasks);
