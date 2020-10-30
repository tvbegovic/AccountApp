import React from 'react';
import { RenderMethodEnum, QuestionTypeEnum} from '../../domainclasses';
import {Label, Input} from 'reactstrap';

export const MultipleChoice = props => (
    props.data.render_id == RenderMethodEnum.checkbox || props.defaultRenderId == RenderMethodEnum.checkbox ? 
        <React.Fragment>
        {props.answer.answerChoices.map(ac => 
            <div className="form-check form-check-inline" key={ac.choice_id}>
                <Input type="checkbox" name={props.data.id} value={ac.choice_id} 
                checked={ac.selected} onChange={props.onChange} className="form-check-input" disabled={props.readOnly}></Input>
                <Label className="form-check-label">{ac.choice.name}</Label>
            </div>)}
        </React.Fragment>
        : null
);