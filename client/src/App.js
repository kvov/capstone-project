import React from "react";
import { Route } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import SignUpPage from "./pages/signup/SignUpPage";
import UserPage from "./pages/profile/UserPage";
import KidList from "./pages/parent/KidList";
import KidAdd from "./pages/parent/KidAdd";
import ParentWishList from "./pages/parent/ParentWishes";
import TaskList from "./pages/parent/TaskList";
import TaskAdd from "./pages/parent/TaskAdd";
import KidTasks from "./pages/kids/KidTasks";
import TaskSuccess from "./pages/kids/TaskSuccess";
import TaskFail from "./pages/kids/TaskFail";
import WishList from "./pages/kids/WishList";
import WishAdd from "./pages/kids/WishAdd";
import Notification from "./pages/notification";
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
        <Route path="/parentWishes" exact component={ParentWishList} />
        <Route path="/kidTasks" exact component={KidTasks} />
        <Route path="/taskSuccess" component={TaskSuccess} />
        <Route path="/taskFail" component={TaskFail} />
        <Route path="/wishList" exact component={WishList} />
        <Route path="/wishAdd" exact component={WishAdd} />
        <Route path="/notifications" exact component={Notification} />
      </div>
    );
  }
}

export default App;
