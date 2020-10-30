import { Settings } from "../settings";


export class AccountService {
    constructor(httpService, userService) {
        this.httpService = httpService;
        this.userService = userService;
        this.api = Settings.apiRoot;
    }

    
      
      sendRecoveryLink (email) {
        return this.httpService.post(this.api + 'recoveryLink?email=' + email, null);
      }
    
      checkRecoveryCode (code) {
        return this.httpService.post(this.api + 'checkRecoveryCode', {data: code});
      }
}