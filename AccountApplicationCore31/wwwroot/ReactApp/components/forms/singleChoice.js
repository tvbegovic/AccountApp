import React from 'react';
import { QuestionTypeEnum, RenderMethodEnum} from '../../domainclasses';
import {Label, Input} from 'reactstrap';

export const SingleChoice = props => (
      
    props.data.render_id == RenderMethodEnum.radio ? 
        <React.Fragment>
            {props.data.choiceGroup.groupChoices.map(gc => 
            <div className="form-check form-check-inline singlechoice" key={gc.choice_id}>
                <Input type="radio" name={props.data.id} value={gc.choice_id} 
                checked={gc.choice_id == props.answer.intValue} onChange={props.onChange} className="form-check-input" disabled={props.readOnly}></Input>
                <Label className="form-check-label">{gc.choice.name}</Label>
            </div>)}
            {props.data.has_comment ? 
                <div className="form-check form-check-inline singlechoice">
                    <Label className="mr-2 form-check-label">{props.data.comment_label}</Label>
                    <Input type="text" value={props.answer.textValue || ''} onChange={(ev)=> props.onChange(ev, 'textValue')} disabled={props.readOnly}></Input>
                </div>
            : null
            }
        </React.Fragment>
        
    : null
    
);