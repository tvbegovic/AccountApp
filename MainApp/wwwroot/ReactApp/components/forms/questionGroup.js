import React from 'react';
import {Form, Label} from 'reactstrap';
import { Question } from './question';

export const QuestionGroup = props => {
    const subProps = (({ lookups, user, readOnly,onTypeAhead,typeAheadProps }) => ({ lookups, user, readOnly,onTypeAhead,typeAheadProps }))(props);   
    return (
        <Form inline={props.data.layout == 'inline'}>
        {props.label ? <Label>{props.label}</Label> : null}
        {props.data && props.data.questions ? 
            props.data.questions.sort((a,b) => a.sequence - b.sequence).map((q,ix) => 
            <Question key={props.sectionElementId + '_' + ix} data={q.question} answer={props.answer} {...subProps}
                index={ix} onChange={props.onQuestionChange}></Question>) : null}        
        </Form>
        
    );
}