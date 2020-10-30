import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Label} from 'reactstrap';
import { Question } from './question';
import { QuestionGroup } from './questionGroup';
import { QuestionTypeEnum } from '../../domainclasses';

export class SectionElement extends Component {

    constructor(props) {
        super(props);
        this.state = {
            typeAheadProps: {
                isLoading: false,
                options: []
            }            
        }
        this.typeAheadInProgress = false;
    }

    render() {
        const {data} = this.props;
        const description = this.getDescription(data);
        const label = this.getLabel(data);
        const showLabel = description || (data.questionGroup && label);
        const headingTypes = [QuestionTypeEnum.heading, QuestionTypeEnum.subheading];
        const subProps = (({ lookups, user, readOnly }) => ({ lookups, user, readOnly }))(this.props);
        subProps.onTypeAhead = (ix, query)=> this.onTypeAhead(ix, query);
        subProps.typeAheadProps = this.state.typeAheadProps;
        subProps.readOnly = data.readOnly || subProps.readOnly;
        this.onQuestionChange = this.onQuestionChange.bind(this);
        return (
            <React.Fragment>
                {data.questionGroup || headingTypes.indexOf(data.question.question_type) < 0 ?
                    <React.Fragment>
                        { showLabel ? <Label>{label}</Label> : null }
                        <div>{description}</div>
                    </React.Fragment>
                    : null
                }                
                
                {data.questionGroup ? 
                    <QuestionGroup data={data.questionGroup} sectionElementId={data.id} {...subProps} onQuestionChange={this.onQuestionChange}
                    answer={data.answer} label={data.label} required={data.required} ></QuestionGroup>
                    : 
                    <Question data={data.question} index={0} answer={data.answer} {...subProps} onChange={this.onQuestionChange}
                    required={data.required}></Question>
                }
                <hr></hr>
                
            </React.Fragment>            
        )
    }

    getLabel(s) {
        if (s.question != null) {
            return s.question.question_text;
        }
        if (s.questionGroup != null) {
            return s.questionGroup.title;
        }
      }
    
    getDescription(s) {
        if (s.question) {
            return s.question.description;
        }
        if (s.questionGroup != null) {
            return s.questionGroup.description;
        }
        return null;
    }

    onTypeAhead(ix, query) {
        if(this.props.onTypeAhead && !this.typeAheadInProgress) {
            this.setState({
                typeAheadProps : {
                    isLoading: true
                }
            });
            this.typeAheadInProgress = true;
            this.props.onTypeAhead(this.props.data, ix,  query).then((response) => {
                this.typeAheadInProgress = false;
                this.setState({
                    typeAheadProps: {
                        isLoading: false,
                        options : response.data
                    }                    
                });
            });
        }
    }

    onQuestionChange(data) {
        data.form_sectionQuestion_id = this.props.data.id;
        this.props.onQuestionChange(data);
    }
}

SectionElement.propTypes = {
    data: PropTypes.shape({
        question: PropTypes.shape(),
        questionGroup: PropTypes.shape()
    })
}