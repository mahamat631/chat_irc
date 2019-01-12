import React from "react";
import io from "socket.io-client";

class Login extends React.Component {
  constructor (props) {
      super(props);
      this.state = {
          inputvalue: ''
      }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
   handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {

    event.preventDefault();
            var user =  {
              pseudo: this.state.value,
          };
          localStorage.setItem('user', JSON.stringify(user));
  }

  
  render() {
    return (
              <div className="limiter">
    <div className="container-login100">
      <div className="wrap-login100 p-t-90 p-b-30">
        <form className="login100-form validate-form" onSubmit={this.handleSubmit}>
          <span className="login100-form-title p-b-40">
            Connexion
          </span>

          <div className="wrap-input100 validate-input m-b-16" data-validate="Please enter email: ex@abc.xyz">
            <input className="input100" type="text" name="username" placeholder="Pseudo"  value={this.state.value} onChange={this.handleChange} />
            <span className="focus-input100"></span>
          </div>

          <div className="container-login100-form-btn">
            <button className="login100-form-btn">
              Connexion
            </button>
          </div>
          
        </form>
      </div>
    </div>
  </div>
    );
  }
}

    export default Login;