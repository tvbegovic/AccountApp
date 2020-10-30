import React, {Component} from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button} from 'reactstrap';

export class ModalDialog extends Component {
    
    constructor(props) {
        super(props);
        let buttonTypes = props.buttons;
        if(props.buttons == null)    
            buttonTypes = [ModalDialogButtonType.Ok,ModalDialogButtonType.Cancel];        
        this.buttons = this.createButtons(buttonTypes);
    }

    createButtons(buttonTypes) {
        let result = [];
        for(var i=0;i<buttonTypes.length;i++) {
            const type = buttonTypes[i];
            let text = '';
            let style = '';
            switch (type) {
                case ModalDialogButtonType.Ok:
                    text = 'Potvrdi';
                    style = 'primary';
                    break;
                case ModalDialogButtonType.Cancel:
                    text = 'Odustani';
                    break;
                case ModalDialogButtonType.Yes:
                    text = 'Da';
                    style = 'primary';
                    break;
                case ModalDialogButtonType.No:
                    text = 'Ne';
                    break;
                default:
                    break;
            }
            result.push(ModalDialogButton(type, text, style));
        }
        return result;
    }

    render() {
        return (
        <Modal isOpen={true}> 
            <ModalHeader>{this.props.title}</ModalHeader>
            <ModalBody>
                {this.props.message}
            </ModalBody>
            <ModalFooter>
                {this.buttons.map((b,ix) => <Button color={b.style} key={ix} onClick={()=>this.onButtonClick(b)}>{b.text}</Button>)}
            </ModalFooter>
        </Modal>
        );
    }

    onButtonClick(b) {
        this.props.onButtonClick(b.type);
    }
}

const ModalDialogButton = (type, text, style) => {
    return {
        type: type,
        text: text,
        style: style
    }
}

export const  ModalDialogButtonType = Object.freeze({
    Ok : 0,
    Cancel: 1,
    Yes: 2,
    No: 3
});