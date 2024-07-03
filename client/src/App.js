import React from "react";
import { Route } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import SignUpPage from "./pages/signup/SignUpPage";
import UserPage from "./pages/parent/UserPage";
import KidList from "./pages/parent/KidList";
import KidAdd from "./pages/parent/KidAdd";
import TaskList from "./pages/parent/TaskList";
import TaskAdd from "./pages/parent/TaskAdd";
import KidTasks from "./pages/kids/KidTasks";
import "./App.css";
import "antd/dist/antd.css";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Route path="/" exact component={UserPage} />
        <Route path="/signUp" exact component={SignUpPage} />
        <Route path="/login" exact component={LoginPage} />
        <Route path="/kids" exact component={KidList} />
        <Route path="/kidsAdd" exact component={KidAdd} />
        <Route path="/tasks" exact component={TaskList} />
        <Route path="/taskAdd" exact component={TaskAdd} />
        <Route path="/kidTasks" exact component={KidTasks}/>
      </div>
    );
  }
}

export default App;
