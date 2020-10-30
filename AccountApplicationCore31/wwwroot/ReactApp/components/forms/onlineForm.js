import React, {Component} from 'react';
import { getError, getBase64 } from '../utils';
import { ErrorMessage, SuccessMessage } from '../Messages';
import { FormSection } from './formSection';
import { Button } from 'reactstrap';
import moment from 'moment';
import { QuestionTypeEnum } from '../../domainclasses';
import { LoggedIn } from '../loggedIn';
import { Header } from '../header';
import { th } from 'date-fns/esm/locale';

//export const FormContext = React.createContext();

export class OnlineForm extends Component {
    
    constructor(props) {
        super(props);
        this.services = props.services;
        this.user = props.services.userService.User;
        this.state = {
            form: null,
            types: null,
            renderMethods: null,
            errorMessage: '',
            successMessage: '',
            submission: null
        };
        this.recoveryKey = 'bb_acc_app_form';        
        this.formContext = {
            validated: false
        }
        this.fileConversionPromises = [];
        this.submissionId = props.id;
        this.question_id_address = 7;
        this.question_id_previousaddress = 8;
        this.question_id_postcode = 10;
        this.postcodeLength = 7;
    }

    componentDidMount() {
        this.services.onlineFormService.getForm(this.user.id, this.submissionId)
        .then(response => {
            const state = response.data;
            const form = state.form;
            //convert dates from string
            for (let i = 0; i < form.sections.length; i++) {
                const section = form.sections[i];
                for (let j = 0; j < section.section.questions.length; j++) {
                    const form_section_question = section.section.questions[j];                    
                    const ans = form_section_question.answer;
                    for (let k = 0; k < ans.questionAnswers.length; k++) {
                        const qa = ans.questionAnswers[k];                    
                        if(qa.dateValue != null) {
                            qa.dateValue = moment(qa.dateValue).toDate();
                        }

                    }                    
                }
            }
            this.loadFromRecovery(state.form, moment(response.data.lastSubmit));
            //this.addValidation(state.form);
            this.handleFormExceptions(state.form);
            this.setState(state);
            setInterval(() => this.saveForRecovery(this.state.form), 20000);
        })
        .catch(err => this.setState({
            errorMessage : getError(err)
        }));
    }

    render() {
        const data = {
            lookups: {
                types: this.state.types,
                renderMethods: this.state.renderMethods                
            },
            user: this.user,
            readOnly: this.props.readOnly,
            onTypeAhead: this.onTypeAhead.bind(this)
        }
        const submissionUser = this.state.submission ? this.state.submission.user : null;
        return (
            <div className="container pt-2 pb-2">
                <LoggedIn user={this.user} onLogout={this.props.onLogout}></LoggedIn>
                {this.state.errorMessage ? <ErrorMessage text={this.state.errorMessage} ></ErrorMessage> : null}
                {this.state.successMessage ? <SuccessMessage text={this.state.successMessage}></SuccessMessage> : null}    
                {    
                    this.state.form ? 
                        <React.Fragment>
                            <Header title={this.state.form.title}></Header>
                            {this.props.showSubmitter && submissionUser ? 
                                <h4 className="mt-2 mb-2">Submitted by: {submissionUser.email} ({submissionUser.company})</h4>
                                : null                            
                            }
                            {!data.readOnly ? <Button className="mb-2" onClick={()=>this.onSubmit()}>Submit</Button> : null}
                            {this.props.returnTo ? <Button className="mb-2 ml-2" onClick={()=>this.goBack()}>Back</Button> : null}
                                {this.state.form.sections.map((s,ix) => 
                                <FormSection key={ix} index={ix} section={s.section} {...data}
                                onQuestionChange={(data)=>this.onQuestionChange(data)}></FormSection>)}                                                    
                            {!data.readOnly ? <Button className="mt-2" onClick={()=>this.onSubmit()}>Submit</Button> : null}                            
                        </React.Fragment>                        
                    : null
                }
            </div>
        );
    }

    saveForRecovery(form) {
        let result = {
            date: null,
            answers:{}
        };
        for (let i = 0; i < form.sections.length; i++) {
            const section = form.sections[i];
            for (let j = 0; j < section.section.questions.length; j++) {
                const form_section_question = section.section.questions[j];
                //Strip validation and files
                const ans = JSON.parse(JSON.stringify(form_section_question.answer));
                ans.submission = null;
                for (let k = 0; k < ans.questionAnswers.length; k++) {
                    const qa = ans.questionAnswers[k];                    
                    qa.validation = null;
                    if(qa.files == null) {
                        qa.files = [];
                    }                  
                }
                result.answers[form_section_question.id] = ans;
            }
        }
        result.date = new Date();
        localStorage.setItem(this.recoveryKey, JSON.stringify(result));
    }

    loadFromRecovery(form, lastSubmitDate) {
        const stor = localStorage.getItem(this.recoveryKey);
        if(stor != null) {
            const savedData = JSON.parse(stor);
            const lastRecoveryDate = moment(savedData.date);
            if(!lastSubmitDate.isValid() || lastSubmitDate.isBefore(lastRecoveryDate)) {
                for (let i = 0; i < form.sections.length; i++) {
                    const section = form.sections[i];
                    for (let j = 0; j < section.section.questions.length; j++) {
                        const form_section_question = section.section.questions[j];
                        if(form_section_question.id in savedData.answers) {
                            //Object.assign(form_section_question.answer, savedData.answers[form_section_question.id]);
                            for (let k = 0; k < form_section_question.answer.questionAnswers.length; k++) {
                                const qa = form_section_question.answer.questionAnswers[k];
                                if(qa.question.question_type != QuestionTypeEnum.upload) {
                                    Object.assign(qa, savedData.answers[form_section_question.id].questionAnswers[k]);
                                    if(qa.dateValue != null) {
                                        qa.dateValue = moment(qa.dateValue).toDate();
                                    }
                                }
                                                            
                            }
                        }
                    }
                }            
            }
            
        }        
    }

    onSubmit() {
        
        if(this.state.submission.answers == null) {
            this.state.submission.answers =  [];
        }
        this.fileConversionPromises = [];
        const form = this.state.form;
        for (let i = 0; i < form.sections.length; i++) {
            const section = form.sections[i];
            for (let j = 0; j < section.section.questions.length; j++) {
                const form_section_question = section.section.questions[j];
                const ans = this.state.submission.answers.find(a => a.formsection_question_id == form_section_question.id);
                /* for (let k = 0; k < ans.questionAnswers.length; k++) {
                    const qa = ans.questionAnswers[k];
                    if(qa.dateValue != null) {
                        //fix for timezones
                        qa.dateValue = moment(qa.dateValue).format('YYYY-MM-DD');
                    }
                    
                } */
                if (ans != null) {
                    this.copyAnswers(ans, form_section_question.answer);
                } else {
                    const obj = {
                        formsection_question_id: form_section_question.id,
                        questionAnswers: Array(form_section_question.answer.questionAnswers.length)
                    };
                    this.copyAnswers(obj, form_section_question.answer);
                    this.state.submission.answers.push(obj);
                }                    
            }
        }    
        Promise.all(this.fileConversionPromises).then( x=> 
            {
                this.services.onlineFormService.post(this.state.submission)
                .then(response => {
                    this.state.submission.id = response.data.id;
                    for (let i = 0; i < response.data.answers.length; i++) {
                        const ans = response.data.answers[i];
                        this.state.submission.answers[i].id = ans.id;
                        for (let j = 0; j < ans.questionAnswers.length; j++) {
                            const qa = ans.questionAnswers[j];
                            Object.assign(this.state.submission.answers[i].questionAnswers[j], qa);
                        }
                    }
                    //Handle
                    this.setState({
                        successMessage: 'Data has been successfully submitted',
                        errorMessage: ''
                    });
                })
                .catch(err => {
                    const response = err.response;
                    //On error, fill validation objects for answers
                    for (let i = 0; i < form.sections.length; i++) {
                        const section = form.sections[i];
                        for (let j = 0; j < section.section.questions.length; j++) {
                            const form_section_question = section.section.questions[j];
                            const ans = response.data.answers.find(a => a.formsection_question_id == form_section_question.id);
                            if (ans != null) {
                                for (let k = 0; k < ans.questionAnswers.length; k++) {
                                    const qa = ans.questionAnswers[k];
                                    form_section_question.answer.questionAnswers[k].validation = qa.validation;    
                                }
                                
                            }                    
                        }
                    }     
                    this.setState({
                        form: form,
                        errorMessage : 'Form couldn\'t be submitted. Correct the errors and try again.',
                        successMessage: ''
                    })
                });       
            }
        );
    }

    goBack() {
        this.props.history.push(this.props.returnTo);
    }

    copyAnswers(target, source) {
        for (let i = 0; i < source.questionAnswers.length; i++) {
            const qa = source.questionAnswers[i];
            if(target.questionAnswers[i] == null) {
                target.questionAnswers[i] = {};
            }
            const ta = target.questionAnswers[i];
            Object.assign(ta, qa);
            if(ta.dateValue != null) {
                ta.dateValue = moment(ta.dateValue).format('YYYY-MM-DD');
            }
            //for uploads, convert file to base64
            if(ta.uploadedFiles != null) {
                if(ta.files == null) {
                    ta.files = [];
                }
                for (let j = 0; j < ta.uploadedFiles.length; j++) {
                    const uf = ta.uploadedFiles[j];
                    const file = {filename: uf.name, data: null, form_question_answer_id: ta.id};
                    ta.files.push(file);
                    this.fileConversionPromises.push(getBase64(uf).then(
                        data => {
                            file.data = data;
                            return data;
                        }
                    ));
                }
            }

        }
    }   

    onQuestionChange(data) {
        if(data.question.question_text == 'Trading style') {
            this.checkSoleTrader(this.state.form, data);
            this.setState({
                form: this.state.form,
                errorMessage: ''
            });  
        }
        /*if(data.question.id == this.question_id_postcode && data.value.length == this.postcodeLength) {
            this.props.services.onlineFormService.getAddresses(data.value)
            .then(response => {
                const addressSectionQuestion = this.findAddressQuestion(data.form_sectionQuestion_id);
                if(addressSectionQuestion != null && response.data.length > 0) {
                    addressSectionQuestion.answer.questionAnswers[0].textValue = response.data[0];
                }
                this.setState({
                    form: this.state.form,
                    errorMessage: ''
                })
            })
        }*/
    }

    findAddressQuestion(formSectionQuestionId) {
        for (let i = 0; i < this.state.form.sections.length; i++) {
            const section = this.state.form.sections[i].section;
            const sectionQuestion = section.questions.find(q=>q.id == formSectionQuestionId);
            if(sectionQuestion != null) {
                return section.questions.find(q=>Math.abs(q.id - sectionQuestion.id) <= 2 && q.question 
                && (q.question.id == this.question_id_address || q.question.id == this.question_id_previousaddress));                
            }            
        }
        return null;
    }

    findSoleTrader(form) {
        const section = form.sections[0].section;
        const sectionQuestion = section.questions.find(q=>q.question && q.question.question_text == 'Trading style');
        if(sectionQuestion != null) {
            return {
                question: sectionQuestion.question,
                value: sectionQuestion.answer.questionAnswers[0].intValue
            };
        }
        return null;
    }

    checkSoleTrader(form, data) {
        
        //Disable controls for sole trader if style != sole trader
        const sole_trader = data.value == 1; //sole trader choice
        const id_low = 34;
        const id_high = 47;
        const section = form.sections[0].section;
        for (let index = 0; index < section.questions.length; index++) {
            const sectionQuestion = section.questions[index];
            if(sectionQuestion.id >= id_low && sectionQuestion.id <= id_high) {
                sectionQuestion.readOnly = !sole_trader;
            }                
        }              
    }

    handleFormExceptions(form) {
        const soleTraderQuestion = this.findSoleTrader(form);
        if(soleTraderQuestion != null) {
            this.checkSoleTrader(form, soleTraderQuestion);
        }
    }

    onTypeAhead(sectionQuestion, questionIndex, query) {
        const question = sectionQuestion.question || sectionQuestion.questionGroup.questions[questionIndex].question;
        if(question.id == this.question_id_address) {
            return this.props.services.onlineFormService.getAddresses(query);
        }
    }

    
}

//FillForm.contextType = FormContext;