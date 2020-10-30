import { Settings } from "../settings";


export class OnlineFormService {

    constructor(httpService) {
        this.api = Settings.apiRoot + 'onlineform';        
        this.httpService = httpService;       
        this.form_id = 1;
    }

    getForm(userId, submissionId) {
        return this.httpService.get(this.api + '/' + this.form_id + '/?userid=' + userId + (submissionId ? '&submissionId=' + submissionId : ''));
    }

    post(submission) {
        return this.httpService.post(this.api, submission);
    }

    getSubmissions() {
        return this.httpService.get(this.api + '/submissions/' + this.form_id );
    }

    getAddresses(postcode) {
        return this.httpService.get(this.api + '/addressSearch/' + postcode);
    }

    
    
}