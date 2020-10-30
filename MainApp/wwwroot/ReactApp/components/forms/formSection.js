import React, {Component} from 'react';
import {Card, CardHeader, CardBody} from 'reactstrap';
import PropTypes from 'prop-types';
import { SectionElement } from './formSectionElement';

export const FormSection = props => {
    const subProps = (({ lookups, user, readOnly,onTypeAhead }) => ({ lookups, user, readOnly,onTypeAhead }))(props);
    return (<Card>
        <CardHeader className="primary">{props.section.title}</CardHeader>
        <CardBody>
            {props.section.questions.sort((a,b)=> a.sequence - b.sequence)
                .map((q, ix) => <SectionElement key={ix} data={q} {...subProps} onQuestionChange={props.onQuestionChange}></SectionElement> )}
        </CardBody>
    </Card>);
}    

FormSection.propTypes = {
    index: PropTypes.number,
    section: PropTypes.shape({
        title: PropTypes.string
    })
}

