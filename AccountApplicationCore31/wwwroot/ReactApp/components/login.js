import React, {Component} from 'react';
import {ErrorMessage} from './Messages';
import {Link, Redirect} from 'react-router-dom';
import { SetObjValue, getError } from './utils';

export class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loginData: {
                username: '',
                password: ''
            },
            registrationData: {
                registrationCode: '',
                username: '',
                password: '',
                password2: ''
            },
            errorMessage: '',
            verified: false,
            redirectTo: ''
        }
        this.accountService = props.services.accountService;
        this.userService = props.services.userService;
    }

    onChange(event, controlName) {
        const data = {
           loginData: {...this.state.loginData},
           registrationData: {...this.state.registrationData}
        };
        SetObjValue(data, event.target.value, controlName);
        this.setState(data);
    }

    
    login() {
        this.accountService.login(this.state.loginData.username, this.state.loginData.password)
        .then(response => {
            const u = response.data;
            if (u != null) {                
                this.props.history.push('/');
              } else {
                this.setState({errorMessage : 'Neispravno korisničko ime ili lozinka'});
            }
        })
        .catch(error => {
            this.setState({
                errorMessage: getError(error)
            });
        });
    }

    render() {
        
        return (
        <div className="container">
            Login 
        </div>
        );
    }

    register() {
        /*if (!this.state.verified) {
        this.accountService.register(this.state.registrationData.registrationCode)
            .then(response => {
                const u = response.data;
                if (u === null) {
                    this.setState({
                        errorMessageReg : 'Neispravan registracijski kod'
                    })
                } else {
                    const state = {
                        registrationData: {
                            id: u.id,
                            username: u.username,
                            registrationCode: this.state.registrationData.registrationCode,
                            password: '',
                            password2: ''
                        },
                        verified: true,
                        registrationButtonText: 'Završi registraciju'
                    }
                    this.setState(state);
                }    
            })
            .catch(err  => this.setState({errorMessageReg : getError(err)}));
        
        } else {
            const data = {
                id: null,
                code : this.state.registrationData.registrationCode,
                password : this.state.registrationData.password,
                password2: this.state.registrationData.password2
            };
            this.userService.updatePassword(data)
            .then(response => {
                    this.accountService.login(this.state.registrationData.username, this.state.registrationData.password)
                    .then(response => this.props.history.push('/') )
                    .catch(err  => this.setState({errorMessageReg : getError(err)}));                    
                }    
            )
            .catch(err  => this.setState({errorMessageReg : getError(err)}));
        }*/
    }
}

export default Login;