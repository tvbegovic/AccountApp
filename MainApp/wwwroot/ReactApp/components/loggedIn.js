import React from 'react';
import { Button } from 'reactstrap';

export const LoggedIn = props => (
    <div className="loggedIn">
        <div>Logged in as: {props.user.email} ({props.user.company})</div>
        <Button className="ml-2" onClick={props.onLogout}>Logout</Button>
    </div>
);