import React from "react";
import { Route } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import SignUpPage from "./pages/signup/SignUpPage";
import UserPage from "./pages/parent/UserPage";
import KidList from "./pages/parent/KidList";
import KidAdd from "./pages/parent/KidAdd";
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
      </div>
    );
  }
}

export default App;
