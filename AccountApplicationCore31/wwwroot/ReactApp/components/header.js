import React from 'react';

export const Header = props=> (
    <div className="title">
        <h1>{props.title}</h1> 
        <img src="/images/logo.jpg"></img>
    </div>
);