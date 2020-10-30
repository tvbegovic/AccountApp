import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './Form.css';

class ValidationForm extends Component {
    state = {
        isValidated: false
    }

    validate = () => {
        const formLength = this.formEl.length;

        if (this.formEl.checkValidity() === false) {
            for(let i=0; i<formLength; i++) {
                const elem = this.formEl[i];
                const errorLabel = elem.parentNode.querySelector('.invalid-feedback');

                if (errorLabel && elem.nodeName.toLowerCase() !== 'button') {
                    if (!elem.validity.valid) {
                        errorLabel.textContent = elem.validationMessage;
                    } else {
                        errorLabel.textContent = '';
                    }
                }
            }

            return false;
        } else {
            for(let i=0; i<formLength; i++) {
                const elem = this.formEl[i];
                const errorLabel = elem.parentNode.querySelector('.invalid-feedback');
                if (errorLabel && elem.nodeName.toLowerCase() !== 'button') {
                    errorLabel.textContent = '';
                }
            };

            return true;
        }
    }

    submitHandler = (event) => {
        event.preventDefault();

        if (this.validate()) {
            this.props.onSubmit();
        }

        this.setState({isValidated: true});
    }

    render() {
        
        const props = Object.assign({}, this.props);
        delete props.onSubmit;

        let classNames = [];
        if (this.props.className) {
            classNames = [this.props.className];            
            //delete props.className;
        }

        if (this.state.isValidated) {
            classNames.push('was-validated');
        }        

        return (
            <form ref={form => this.formEl = form} onSubmit={this.submitHandler} {...props} className={classNames.join(' ')} noValidate>
                {this.props.children}
            </form>
        );
    }
}

ValidationForm.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    onSubmit: PropTypes.func.isRequired
};

export default ValidationForm;