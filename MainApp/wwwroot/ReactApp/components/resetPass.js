import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Label, Input, Button, FormGroup} from 'reactstrap';
import { getError } from './utils';
import { ErrorMessage } from './Messages';

export class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            password2: '',
            errorMessage: '',
            successMessage: '',
            valid: null,
            changed: false
        }
        this.services = props.services;        
    }

    componentDidMount() {
        this.id = this.props.match.params.id;
        const { services} = this.props;
        services.userService.recoverPass(this.id)
        .then(response => {
            this.setState({valid: true});
        })
        .catch(err => {
            this.setState({
                errorMessage: getError(err),
                valid: false
            });
        });    
    }

    render() {
        return (
            <div className="containerreg">
                <div className="sign-up-content">
                    <h3>Password change</h3>     
                    <ErrorMessage text={this.state.errorMessage}></ErrorMessage>
                    { 
                    this.state.valid ? 
                        !this.state.changed ? 
                            <React.Fragment>
                                <FormGroup>
                                    <Label>Password:</Label>
                                    <Input type="password" value={this.state.password} name="password" onChange={(e)=>this.onChange(e)}></Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Repeat the password:</Label>
                                    <Input type="password" value={this.state.password2} name="password2" onChange={(e)=>this.onChange(e)}></Input>
                                </FormGroup>
                                <Button color="primary" onClick={()=>this.onSubmit()}>Submit</Button>
                            </React.Fragment>
                            :                         
                            <React.Fragment>
                                <div>{this.state.successMessage}</div>
                                <Link to={'/login'}>Go to login page</Link>
                            </React.Fragment>
                    :
                    this.state.valid == false ?
                        <div>Invalid request</div>
                    : null
                    }
                </div>
            </div>
            
        );
    }

    onChange(e) {
        const state = {};
        state[e.target.name] = e.target.value;
        this.setState(state);
    }

    onSubmit() {
        this.services.userService.updatePassword(this.id, this.state.password, this.state.password2).
        then(response => this.setState({
            successMessage: 'The password has been successfully changed',
            errorMessage: '',
            changed: true
        }))
        .catch(err=> this.setState({
            errorMessage: getError(err)
        }))
    }
}