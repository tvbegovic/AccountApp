import React, { Component } from 'react';
import './App.css';

import { UserService } from '../services/userService';
import {Route, withRouter} from 'react-router';
import {Redirect} from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faBan, faEdit, faTrash, faMinus, faCheck, faRedo} from '@fortawesome/free-solid-svg-icons';
import { Register } from './register';
import { Validate } from './validate';
import { OnlineForm } from './forms/onlineForm';
import { ForgotPass } from './forgotPass';
import { ResetPassword } from './resetPass';
import { Submissions } from './forms/submissions';

library.add([faBan, faEdit, faTrash, faMinus, faCheck, faRedo]);

class App extends Component {

  constructor(props) {
    super(props);
    this.userService = props.services.userService;
    this.props.services.blockUIService.callback = this.uiBlockChange.bind(this);
    this.state = {
      title: 'Account application portal',
      blockUI: false,
      services: props.services
    };
  }

  componentDidMount() {
    
  }  

  logout() {
    this.userService.clearUser();
    this.props.history.push('/login');
  }
    
  render() {    
    
    const data = {
      user: this.userService.User,
      services: this.props.services
    };
    
    return (
      <div className="App">
        <div>
          {/* <NavBar {...data} navigationItems={this.state.navigationItems} onLogout={()=> this.logout()}/> */}          
          {
            data.user == null && ['/register', '/validate', '/resetPassword', '/forgotPass','/login'].findIndex(s => this.props.location.pathname.startsWith(s)) < 0 ? 
            <Redirect to="/register"></Redirect> 
             :
            <div>
              <Route path="/login" exact={true} render={(props) => <Register isRegistration={false} {...data} {...props} ></Register> }></Route>
              <Route path="/register" exact={true} render={(props) => <Register {...data} {...props} ></Register> }></Route>              
              <Route path="/validate/:id" exact={true} render={(props) => <Validate {...data} {...props} ></Validate> }></Route>              
              <Route path="/forgotPass" exact={true} render={(props)=> <ForgotPass {...data} {...props}></ForgotPass>}></Route>
              <Route path="/resetPassword/:id" exact={false} render={(props) => <ResetPassword {...data} {...props} ></ResetPassword> }></Route>              
              {data.user != null && data.user.isAdmin ? 
                <React.Fragment>
                    <Route path="/" exact={true} render={(props) => <Submissions {...data} {...props} onLogout={()=>this.logout()} ></Submissions> }></Route> 
                    <Route path="/edit/:id" exact={true} 
                        render={(props) => 
                        <OnlineForm id={props.match.params.id} {...data} {...props} onLogout={()=>this.logout()} 
                        showSubmitter={true} returnTo={'/'}></OnlineForm>} >
                    </Route> 
                    <Route path="/view/:id" exact={true} 
                        render={(props) => 
                        <OnlineForm id={props.match.params.id} readOnly={true} {...data} {...props} onLogout={()=>this.logout()} 
                            showSubmitter={true} returnTo={'/'}>
                        </OnlineForm> }>
                    </Route> 
                </React.Fragment>                
                :
                <Route path="/" exact={true} render={(props) => <OnlineForm {...data} {...props} onLogout={()=>this.logout()} ></OnlineForm> } ></Route> 
              }
              
            </div>
          }    
          { this.state.blockUI ? 
          <div>
                <div className="in modal-backdrop spinner-overlay"></div>
                <div className="spinner-message-container" aria-live="assertive" aria-atomic="true">       
                    <div className="loading-message">
                        <img src="/images/loading-spinner-grey.gif" className="rotate90"></img>
                        <span>&nbsp;&nbsp;please wait...</span>
                    </div>        
                </div>
          </div> : ''
          }
        </div>        
      </div>
    );
  }

  uiBlockChange(value) {
    this.setState({
      blockUI : value
    });
  }

  logout() {
    this.userService.logout();
    this.props.history.push('/login');
  }
}


export default withRouter(App);
