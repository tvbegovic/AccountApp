import React, {Component} from 'react';
import {ErrorMessage, SuccessMessage} from './Messages';
import { validateEmail, getError } from './utils';
import {Link} from 'react-router-dom';
import './register.css';
import {Form, Button, FormGroup, Input, Label, FormFeedback} from 'reactstrap';


export class Register extends Component {

    constructor(props) {
        super(props);
        this.state = {
            registrationData: {
                company: '',
                email: '',
                password: '',
                terms: false,
                remember: false
            },
            wasValidated: false,
            validation: {
                company: { invalid: false, message: ''},
                email: { invalid: false, message: ''},
                password: { invalid: false, message: ''},
                terms: {invalid: false, message: ''}
            },
            errorMessage: '',            
            redirectTo: '',
            successMessage: '',
            isRegistration: props.isRegistration != null ? props.isRegistration : true,
            registrationPending: null,
        }
        this.accountService = props.services.accountService;
        this.userService = props.services.userService;
    }

    render() {
        return (
            <React.Fragment>
                <div className="bigTitle">Account signup</div>
                <div className="containerreg">
                    <div className="sign-up-content">
                        {this.state.errorMessage ? 
                            <ErrorMessage text={this.state.errorMessage}></ErrorMessage>
                            : null
                            }                        
                        <Form className={'signup-form'}>
                           
                           {this.state.registrationPending ? 
                           <SuccessMessage text={this.state.successMessage}></SuccessMessage>
                           :
                           <React.Fragment>
                            {this.state.isRegistration ? 
                                <FormGroup>
                                    <Label for="company">Company</Label>
                                    <Input type="text" className="form-control" name="company" id="company" value={this.state.registrationData.company}
                                    onChange={(e)=> this.onChange(e)} invalid={this.state.validation.company.invalid}/>
                                    <FormFeedback tooltip>{this.state.validation.company.message}</FormFeedback>
                                </FormGroup>
                                : null 
                            }
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input type="email" className="form-control" name="email" id="email" value={this.state.registrationData.email}
                                onChange={(e)=> this.onChange(e)} 
                                invalid={this.state.validation.email.invalid}/>
                                <FormFeedback tooltip>{this.state.validation.email.message}</FormFeedback>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="pass">Password</Label>
                                <Input type="password" className="form-control" name="password" id="pass" onChange={(e)=> this.onChange(e)}
                                value={this.state.registrationData.password}
                                invalid={this.state.validation.password.invalid}
                                />
                                <FormFeedback tooltip>{this.state.validation.password.message}</FormFeedback>
                            </FormGroup>

                            { this.state.isRegistration ? 
                                
                                <FormGroup check className="mt-3">                                    
                                    <Label for="agree-term" check>
                                        <Input type="checkbox" name="terms" id="agree-term" onChange={(e)=> this.onChange(e)} 
                                            checked={this.state.registrationData.terms}
                                            invalid={this.state.validation.terms.invalid}
                                            />
                                            I agree with <a href="#" target="_blank" className="term-service"                                            
                                            >Terms of service</a>                                                                                
                                        <FormFeedback tooltip>{this.state.validation.terms.message}</FormFeedback>
                                    </Label>                                    
                                </FormGroup>                                                              
                                : null
                            }
                            
                            { !this.state.isRegistration ? 
                            
                            <Link to={'/forgotPass'}>Forgot password?</Link>
                            : null}

                            <div className="mt-2">
                            <Button name="submit" type="submit" id="submit" color="primary" block={true} onClick={e=>this.onSubmit(e)} 
                                >{this.state.isRegistration ? "Register" : "Login" }</Button>
                            </div>
                            { this.state.isRegistration ? 
                            <p className="loginhere">
                                Already have an account ?<a className="loginhere-link" onClick={()=> this.gotoLogin()}> Log in</a>
                            </p>
                            : null 
                            }
                            </React.Fragment>
                           }
                               
                        </Form>
                        
                    </div>
                </div>
            </React.Fragment>
        );        
    }

    onChange(event) {
        const state = {
            registrationData : this.state.registrationData
        };
        const prop = event.target.type != 'checkbox' ? 'value' : 'checked';
        state.registrationData[event.target.name] = event.target[prop];
        this.setState(state);
        if(this.state.wasValidated) {
            this.validate();
        }
        
    }

    onSubmit(e) {

        e.preventDefault();
        if(this.validate()) {
            const key = sessionKey; //global var
            if(this.state.isRegistration) {
                this.userService.register(this.state.registrationData, key).then(response => {
                    this.setState({
                        registrationPending: true,
                        successMessage: 'Registration successful. Check your mailbox for account validation email'
                    })
                })
                .catch(err => this.setState({
                    errorMessage: getError(err)
                }));
            } else {
                this.userService.login(this.state.registrationData.email, this.state.registrationData.password).then(response => {
                    this.props.history.push('/');    
                })
                .catch(err => this.setState({
                    errorMessage: getError(err)
                }));
            }
            
            
        }        
        this.setState({
            wasValidated: true
        });
    }

    validate() {
        
        const data = this.state.registrationData;
        const validation = this.state.validation;
        if(data.company.length == 0 && this.state.isRegistration) {
            validation.company.invalid = true;
            validation.company.message = 'Company name is required';
        } else {
            validation.company.invalid = false;
        }
        if(data.email.length == 0) {
            validation.email.message = 'Email is required';            
        } else if(!validateEmail(data.email)) {
            validation.email.message = 'Invalid email format';            
        } else {
            validation.email.message = '';            
        }
        validation.email.invalid = validation.email.message.length > 0;
        if(data.password.length == 0) {
            validation.password.invalid = true;
            validation.password.message = 'Password is required';
        } else {
            validation.password.invalid = false;
        }

        if(!data.terms && this.state.isRegistration) {
            validation.terms.invalid = true;
            validation.terms.message = 'You must agree to the terms of service.';
        } else {
            validation.terms.invalid = false;
        }

        let result = true;
        for(var key in validation) {
            if(validation[key].invalid) {
                result = false;
                break;
            }
        }
        this.setState({
            validation: validation
        });
        return result;
    }

    gotoLogin() {
        this.setState({
            isRegistration: false
        });
    }

}