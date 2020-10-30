import React, { Component } from 'react';
import { getError, formatDateTime } from '../utils';
import { LoggedIn } from '../loggedIn';
import { Header } from '../header';
import { Button } from 'reactstrap';

export class Submissions extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            successMessage: '',
            data: []
        }
        this.user = props.services.userService.User;
    }

    async componentDidMount() {
        try {
            const response = await this.props.services.onlineFormService.getSubmissions();    
            this.setState({
                data: response.data
            })
        } catch (error) {
            this.setState({
                errorMessage: getError(error)
            });
        }
        
    }

    render() {
        return (
             <div className="container pt-2 pb-2">
                <LoggedIn user={this.user} onLogout={this.props.onLogout}></LoggedIn>
                {this.state.errorMessage ? <ErrorMessage text={this.state.errorMessage} ></ErrorMessage> : null}
                {this.state.successMessage ? <SuccessMessage text={this.state.successMessage}></SuccessMessage> : null}
                <Header title={'Submissions'}></Header>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Created</th>
                            <th>Last updated</th>
                            <th></th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.data.length > 0 ? 
                        this.state.data.map(d => 
                        <tr key={d.id}>
                            <td>{d.user ? <span>{d.user.email} ({d.user.company})</span> : null} </td>
                            <td>{formatDateTime(d.dateCreated)}</td>
                            <td>{formatDateTime(d.dateUpdated)}</td>
                            <td>
                                <Button onClick={()=>this.onView(d)} >View</Button>
                                <Button onClick={()=>this.onEdit(d)} className="ml-2" >Edit</Button>
                            </td>                            
                        </tr>)
                        : null }
                    </tbody>
                </table>
            </div>
        );
    }

    onEdit(s) {
        this.props.history.push('/edit/' + s.id);
    }

    onView(s) {
        this.props.history.push('/view/' + s.id);
    }
}