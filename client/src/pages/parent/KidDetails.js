import React, { Component } from "react";
import axios from "axios";
import { notification } from "antd";
import Navbar from "../../components/Navbar";
import profile from "../../images/user.png";
import "./KidDetails.css";
import moment from 'moment';

class KidDetails extends Component {
    componentDidMount() {
        let localStorage = window.localStorage;
        if (localStorage.islogin !== "1") {
            this.props.history.replace("/login");
            return; 
        }
        const kidId = this.props.location.state?.kidId || localStorage.id;
        this.loadData(kidId);
        console.log(kidId);
    }

    constructor(props) {
        super(props);
        let localStorage = window.localStorage;
        this.state = {
            username: localStorage.username,
            kid: null,
            tasks: [],
            wishes: [],
        };
    }

    async loadData(id) {
        try {
            // Fetch kid details
            let resultKid = await axios.get(`/api/kidDetails/${id}`);
            console.log("API Kid Response:", resultKid.data); 
            this.setState({ kid: resultKid.data.data });

            // Fetch tasks and process them
            let resultTasks = await axios.get(`/api/kidTasks/${id}`);
            console.log("API Kid Tasks Response:", resultTasks.data);
            let tasks = resultTasks.data.data;

            // Process tasks to filter and update recurring tasks
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
            this.setState({ tasks: filteredTasks });

            // Fetch wishes
            let resultWishes = await axios.get(`/api/kidWishes/${id}`);
            console.log("API Kid Wishes Response:", resultWishes.data);
            this.setState({ wishes: resultWishes.data.data });

        } catch (e) {
            notification.error({
                message: e.response?.data?.msg || "Error fetching kid details",
                title: "Error",
            });
        }
    }

    renderRecurrence(recurrence) {
        if (!recurrence) return "";

        const { frequency, daysOfWeek } = recurrence;

        let recurrenceText = `${frequency}`;
        
        if (daysOfWeek && daysOfWeek.length > 0) {
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const days = daysOfWeek.map(day => dayNames[day]).join(", ");
            recurrenceText += ` on ${days}`;
        }

        return recurrenceText;
    }


    render() {
        const { username, kid, tasks, wishes } = this.state;

        // If kid is null or not yet loaded, show a loading message or a placeholder
        if (!kid) {
            return (
                <div className="kid-detail-page">
                    <Navbar username={username} />
                    <div className="page-title">Kid Details</div>
                    <div>Loading...</div> 
                </div>
            );
        }

        return (
            <div className="kid-detail-page">
                <Navbar username={username} />
                <div className="page-title">Kid Details</div>

                <div className="kid-detail-page__content">
                    <div className="kid-card__photo-wrapper">
                        {kid.profilePicture ? (
                            <img
                                className="kid-card__photo"
                                src={kid.profilePicture}
                                alt="Kid Profile"
                            />
                        ) : (
                            <img src={profile} alt="Default Profile" className="kid-card__photo" />
                        )}
                    </div>
                    <div className="kid-card__details">
                        <p className="kid-card__username">{kid.username}</p>
                        <p className="kid-card__coins">{kid.wallet} Coins</p>
                    </div>
                    <div className="kid-details__tasks">
                    <p className="kid-card__username">Tasks</p>
                    {tasks.length ? (
                        <ul>
                            {tasks.map((task) => (
                                <li key={task._id}>
                                    <p><strong>Description: {task.taskDescription}</strong></p> Due: {new Date(task.dueDate).toISOString().split('T')[0]}
                                    <p>Cost: {task.taskCost} coins | Status: {task.taskStatus}</p> 
                                    <p>{task.recurrence && this.renderRecurrence(task.recurrence)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No tasks found.</p>
                    )}
                </div>

                <div className="kid-details__wishes">
                    <p className="kid-card__username">Wishes</p>
                    {wishes.length ? (
                        <ul>
                            {wishes.map((wish) => (
                                <li key={wish._id}><p><strong>Description: {wish.wishDescription}</strong></p> Cost: {wish.wishCost} coins </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No wishes found.</p>
                    )}
                </div>

                </div>
            </div>
        );
    }
}

export default KidDetails;
