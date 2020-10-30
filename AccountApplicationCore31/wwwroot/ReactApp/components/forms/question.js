import React, {Component} from 'react';
import {Label,Input, FormGroup} from 'reactstrap';
import { QuestionInput } from './questionInput';
import { QuestionTypeEnum, RenderMethodEnum } from '../../domainclasses';

export class Question extends Component {

    constructor(props) {
        super(props);
        this.state = {
            answer : props.answer
        }
        this.onChange = this.onChange.bind(this);
    }

    render() {
        const props = this.props;
        const headingTypes = [QuestionTypeEnum.heading, QuestionTypeEnum.subheading];
        const subProps = (({ lookups, user, readOnly, onTypeAhead, typeAheadProps }) => ({ lookups, user, readOnly,onTypeAhead, typeAheadProps }))(this.props);
        subProps.onTypeAhead = (query)=> props.onTypeAhead(props.index, query);
        return (
            <React.Fragment>
                <FormGroup className="mr-2" inline={props.data.render_id == RenderMethodEnum.radio}>
                    
                    { props.data.question_type == QuestionTypeEnum.heading ?
                        <React.Fragment>
                            <h4>{props.data.question_text}</h4>
                            <div>{props.data.description}</div>
                        </React.Fragment>                              
                        :
                        props.data.question_type == QuestionTypeEnum.subheading ? 
                        <React.Fragment>
                            <h6>{props.data.question_text}</h6>
                            <div>{props.data.description}</div>
                        </React.Fragment>
                        :
                        props.data.label_editable ? 
                        <Input className="mr-2" type="text" value={this.state.answer.questionAnswers[props.index].textValue} onChange={this.onChange}></Input>
                        :
                        <Label className="mr-2">{props.data.question_text} 
                            {props.data.sub_text ? <span className="labelcomment"> {props.data.sub_text}</span> : null}
                        </Label>
                    }
                    {headingTypes.indexOf(props.data.question_type) < 0 ? 
                        <QuestionInput data={props.data} answer={this.state.answer.questionAnswers[props.index]} 
                        onChange={this.onChange} {...subProps}></QuestionInput>
                        : null
                    }
                </FormGroup>        
            </React.Fragment>
            
        );
    }

    onChange(ev, field) {
        const answer = this.state.answer;
        const q = this.props.data;
        const a = answer.questionAnswers[this.props.index];
        const value = q.autocomplete ? ev[0] : ev.target.value;
        if(answer != null) {
            if(q.label_editable || q.question_type == QuestionTypeEnum.shorttext) {
                a.textValue = value;
            } else if(q.question_type == QuestionTypeEnum.date) {
                a.dateValue = value;
            } else if(q.question_type == QuestionTypeEnum.singlechoice) {
                if(field == null) {
                    a.intValue = value;
                } else {
                    //Maybe comment option
                    a[field] = value;
                }                
            } else if(q.question_type == QuestionTypeEnum.multiplechoice) {
                const checked = ev.target.checked;
                const ansChoice = a.answerChoices.find(c=>c.choice_id == value);
                if(ansChoice != null) {
                    ansChoice.selected = checked;
                }
            } else if(q.question_type == QuestionTypeEnum.upload) {
                if(ev.target.files) {
                    a.uploadedFiles = ev.target.files;
                } else {
                    a.files = ev.files;
                }                
            }
            const state = {
                answer: answer
            }
            if(a.validation) {
                this.validate(q, value, a);
            } 
            
            this.setState(state);
            if(this.props.onChange) {
                this.props.onChange({
                    question: this.props.data,
                    value: value
                })
            }
        }        
    }

    validate(q, value, qa) {
        if([QuestionTypeEnum.shorttext, QuestionTypeEnum.date].indexOf(q.question_type) >= 0) {
            qa.validation.valid = !(value == null || value.length == 0)            
        } else if(q.question_type == QuestionTypeEnum.singlechoice) {
            qa.validation.valid = value != null;
        } else if(q.question_type == QuestionTypeEnum.multiplechoice) {
            qa.validation.valid = qa.answerChoices.find(ac=>ac.selected) != null;
        }

    } 
}