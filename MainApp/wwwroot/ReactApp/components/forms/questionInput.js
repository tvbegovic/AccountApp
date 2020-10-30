import React, {Component} from 'react';
import {Label, Input, FormFeedback, InputGroup, InputGroupAddon, Button} from 'reactstrap';
import { QuestionTypeEnum, RenderMethodEnum} from '../../domainclasses';
import { escapeComponent } from 'uri-js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { SingleChoice } from './singleChoice';
import { MultipleChoice } from './multipleChoice';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

export class QuestionInput extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const data = this.props.data;
        const props = this.props;
        const type = props.lookups.types.find(l=>l.id == data.question_type);
        const user = props.user;
        const typeAheadProps = props.typeAheadProps;
        typeAheadProps.minLength = data.autocomplete_min;
        const extraProps = {
            defaultRenderId : type ? type.default_render_id : null
        };
        return (
            <React.Fragment>
            {
                data.question_type == QuestionTypeEnum.shorttext ?
                    <React.Fragment>
                        {data.autocomplete ? 
                        <React.Fragment>
                            <AsyncTypeahead {...typeAheadProps} delay={1000} onSearch={props.onTypeAhead} onChange={props.onChange} disabled={props.readOnly} ></AsyncTypeahead>
                            {props.answer.validation && !props.answer.validation.valid ? 
                                <div className="invalid-tooltip-custom">{props.answer.validation ? props.answer.validation.message : ''}</div> 
                                : null
                            }
                        </React.Fragment>                        
                        :
                        <Input type="text" name={props.data.id}  value={props.answer.textValue || ''} onChange={props.onChange} 
                        invalid={props.answer.validation && !props.answer.validation.valid} disabled={props.readOnly}></Input>
                        }
                        
                        <FormFeedback tooltip>{props.answer.validation ? props.answer.validation.message : ''}</FormFeedback>
                    </React.Fragment>
                : 
                data.question_type == QuestionTypeEnum.date ? 
                    <React.Fragment>
                        <DatePicker className="form-control" selected={props.answer.dateValue} dateFormat="dd/MM/yyyy" 
                        onChange={(d)=> this.onDateChange(d)} disabled={props.readOnly}></DatePicker>
                        {props.answer.validation && !props.answer.validation.valid ? 
                            <div className="invalid-tooltip-custom">{props.answer.validation ? props.answer.validation.message : ''}</div> 
                            : null
                        }
                    </React.Fragment>
                : 
                data.question_type == QuestionTypeEnum.singlechoice ? 
                    <React.Fragment>
                        <SingleChoice {...props} onChange={props.onChange}></SingleChoice>
                        {props.answer.validation && !props.answer.validation.valid ? 
                            <div className="invalid-tooltip-custom">{props.answer.validation ? props.answer.validation.message : ''}</div> 
                            : null
                        }
                    </React.Fragment>
                : 
                data.question_type == QuestionTypeEnum.multiplechoice ?
                    <React.Fragment>
                        <MultipleChoice {...props} {...extraProps} onChange={props.onChange}></MultipleChoice>
                        {props.answer.validation && !props.answer.validation.valid ? 
                            <div className="invalid-tooltip-custom">{props.answer.validation ? props.answer.validation.message : ''}</div> 
                            : null
                        }
                    </React.Fragment>
                : 
                data.question_type == QuestionTypeEnum.upload ?
                    <React.Fragment>
                        <div>
                            {
                                props.answer.files ? 
                                props.answer.files.map((f,ix) => 
                                <InputGroup key={ix}>
                                    <a target="_blank" href={this.getFileUrl(user,f)}>{f.filename}</a>
                                    <InputGroupAddon addonType="append"><Button className="ml-2" close onClick={()=>this.removeFile(ix)}></Button></InputGroupAddon>
                                </InputGroup>)
                                : null
                            }
                            
                        </div>
                        <Input type="file" multiple name={props.data.id}  onChange={props.onChange} 
                        invalid={props.answer.validation && !props.answer.validation.valid}></Input>
                        <FormFeedback tooltip>{props.answer.validation ? props.answer.validation.message : ''}</FormFeedback>
                    </React.Fragment>
                :
                null
            }
            </React.Fragment>
        );
    }

    /* onChange(event, field, targetField) {
        const answer = this.state.answer;
        answer[field] = targetField ? event.target[targetField] : event.target.value;
        this.setState({
            data: this.state.data,
            answer: answer
        });
    } */

    onDateChange(date) {
        this.props.onChange({
            target: {
                value: date
            }
        });
    }

    getFileUrl(user,f) {
        return '/files/' + user.id.toString() + '/' + f.filename;
    }

    removeFile(ix) {
        if(this.props.answer.files) {
            this.props.answer.files.splice(ix,1);
            this.props.onChange({
                    target: {},
                    files: this.props.answer.files                
            });
        }
    }

    
}
