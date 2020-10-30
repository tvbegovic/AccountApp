import React, { Component } from 'react';
import { RenderMethodEnum } from '../domainclasses';
import { FormGroup, Button, Input, Label } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ErrorMessage, SuccessMessage } from './Messages';
import { getError } from './utils';

export class ForgotPass extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            errorMessage: '',
            successMessage: ''
        };
        this.services = props.services;
    }

    render() {
        return (
            <div className="containerreg">
                <div className="sign-up-content">
                    <Link to={'/login'}>Back</Link>
                    <h3>Forgot password</h3>                
                    <ErrorMessage text={this.state.errorMessage}></ErrorMessage>
                    <SuccessMessage text={this.state.successMessage}></SuccessMessage>
                    <FormGroup>
                        <Label>Email</Label>
                        <Input type="text" value={this.state.email} onChange={(e)=>this.onChange(e)}></Input>
                    </FormGroup>
                    <Button color="primary" onClick={()=> this.onSubmit()}>Submit</Button>
                </div>                
            </div>            
        );
    }

    onChange(event) {
        this.setState({
            email: event.target.value
        });
    }

    onSubmit() {
        this.services.userService.forgotPass(this.state.email).then(response => {
            this.setState({
                successMessage: 'Email with the instructions how to reset the password has been sent. Check your mailbox',
                errorMessage: ''
            });
        })
        .catch(err=> this.setState({
            errorMessage: getError(err),
            successMessage: ''
        }));        
    }
}