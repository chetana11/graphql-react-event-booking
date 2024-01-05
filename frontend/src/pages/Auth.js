import React, { Component } from 'react';
import './Auth.css';
import AuthContext from '../context/auth-context';
/*@purpose; class for login
@author:spoorthi
@parameters: react
@return type
*/
class AuthPage extends Component {
  state = {
    isLogin: true,
    loginFailed: false
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }
/*@purpose; function for login
@author:spoorthi
@parameters: react
@return type : string
*/
  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin, loginFailed: false };
    });
  };

  submitHandler = event => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }
/*@purpose; query for login and creating the user
@author:spoorthi
@parameters: react
@return type
*/
    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            email
            tokenExpiration
          }
        }
      `,
      variables: {
        email: email,
        password: password
      }
    };

    if (!this.state.isLogin) {
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: {email: $email, password: $password}) {
              _id
              email
            }
          }
        `,
        variables: {
          email: email,
          password: password
        }
      };
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        if (resData.data.login.token) {
          localStorage.setItem('token',resData.data.login.token);
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.email,
            resData.data.login.tokenExpiration
          );
        } else {
          throw new Error('Bad Credentials');
        }
      })
      .catch(err => {
        console.log(err.message);
        alert('Bad Credentials');
        this.setState({ loginFailed: true });
      });
  };
/*@purpose; login using form controls
@author:spoorthi
@parameters: react
@return type
*/
  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
          <h2> LOGIN HERE!</h2>
        <div className="form-control">
          <label htmlFor="email">E-Mail</label>
          <input type="email" id="email" ref={this.emailEl} />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={this.passwordEl} />
        </div>
        {this.state.loginFailed && (
          <p style={{ color: 'red' }}>Bad Credentials. Please try again.</p>
        )}
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" onClick={this.switchModeHandler}>
            Switch to {this.state.isLogin ? 'Signup' : 'Login'}
          </button>
        </div>
      </form>
    );
  }
}

export default AuthPage;
