import React from 'react';

const Message = (props) => (
    props.text ? <div className={'alert alert-' + props.type}>{props.text}</div> : ''
);

const ErrorMessage = (props) => {
    return <Message type="danger" {...props}></Message>
}

const SuccessMessage = (props) => {
    return <Message type="success" {...props}></Message>
}

export {Message, ErrorMessage, SuccessMessage };