import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";  
import Chat from "./Chat";
import socketIOClient from "socket.io-client";
import io from "socket.io-client";

class App extends Component {
  constructor() {
    super();

    this.state = {
      response: false,
      endpoint: "http://localhost:4001",
    loading: true,

    };
}
  componentDidMount() {
    setTimeout(() => this.setState({ loading: false }), 2000); // Temps chargement
  }
  
  render() {
    const { loading } = this.state;
    
    if(loading) { 
      return null; 
    }
    return (
      <Router>
      <Switch>
      <Route path="/" render={props =>
        <Chat />
      } />
      </Switch>
      </Router>
      );
  }
}

export default App;