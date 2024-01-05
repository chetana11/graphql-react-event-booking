import React, { Component } from 'react';
import jwt from 'jsonwebtoken';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AuthPage from './pages/Auth';
import BookingsPage from './pages/Bookings';
import EventsPage from './pages/Events';
import MainNavigation from './components/Navigation/MainNavigation';
import AuthContext from './context/auth-context';

import './App.css';

class App extends Component {
  state = {
    token: null,
    userId: null,
    email:null
  };
  
  login = (token, userId, email,tokenExpiration) => {
    this.setState({ token: token, userId: userId , email: email});
  };

  logout = () => {
    localStorage.setItem('token',"");
    this.setState({ token: null, userId: null });
  };
  componentDidMount() {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      // Decode token and set user data if the token exists
      const userData = jwt.decode(storedToken);
       // Access user data from the decoded payload
      if (userData) {
        this.setState({ token: storedToken, userId: userData.userId , email: userData.email});
      } 
    }
  }
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <AuthContext.Provider
            value={{
              token: this.state.token,
              userId: this.state.userId,
              email:this.state.email,
              login: this.login,
              logout: this.logout
            }}
          >
            <MainNavigation />
            <main className="main-content">
              <Switch>
                {this.state.token && <Redirect from="/" to="/events" exact />}
                {this.state.token && (
                  <Redirect from="/auth" to="/events" exact />
                )}
                {!this.state.token && (
                  <Route path="/auth" component={AuthPage} />
                )}
                <Route path="/events" component={EventsPage} />
                {this.state.token && (
                  <Route path="/bookings" component={BookingsPage} />
                )}
                {!this.state.token && <Redirect to="/auth" exact />}
              </Switch>
            </main>
          </AuthContext.Provider>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
