import React, {Component} from 'react';
import {Alert} from 'reactstrap';
import { getError } from './utils';
import { ErrorMessage } from './Messages';

export class Validate extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            errorMessage: ''
        };
    }

    componentDidMount() {
        var id = this.props.match.params.id;
        if(id != null) {
            const { services} = this.props;
            services.userService.validate(id)
            .then(response => {
                services.userService.saveUser(response.data);            
                setTimeout(()=> this.props.history.push('/'), 2000);
            })
            .catch(err => {
                this.setState({
                    errorMessage: getError(err)
                });
            });    
        } else {
            this.setState({
                errorMessage: 'invalid url'
            })
        }
        
    }

    render() {
        return (
            <React.Fragment>
                <div className="bigTitle">Account signup</div>
                <div className="containerreg">
                {this.state.errorMessage ? 
                    <ErrorMessage text={this.state.errorMessage}></ErrorMessage>
                    :
                    <div className="validatebox">
                        Account successfully validated. You will be redirected to main page soon. If nothing happens, <a href="/">click 
                            this link.</a>                        
                    </div>                    
                }
                
                </div>
            </React.Fragment>
            
        );
    }
}
