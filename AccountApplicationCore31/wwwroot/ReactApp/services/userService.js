import { Settings } from "../settings";


export class UserService {

    constructor(httpService) {
        this.api = Settings.apiRoot + 'user/';
        this.userKey = Settings.userKey;
        this.tokenKey = Settings.tokenKey;
        this._user = null;        
        this.httpService = httpService;        
        
    }
    
    get User() {
      if (this._user == null) {
        this._user = this.loadUser();
      }
      return this._user;
    }

    loadUser() {
        const sUser = localStorage.getItem(this.userKey);
        if (sUser != null) {
          return JSON.parse(sUser);
        }
        return null;
    }
    

    saveUser(user) {
        this._user = user;
        localStorage.setItem(this.userKey, JSON.stringify(user));
        localStorage.setItem(this.tokenKey, user.token);
        //this.userSetEvent.emit(user);
    }    

    clearUser() {
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey);
        this._user = null;            
    }

    logout() {
        this.clearUser();
     }
    
      
    login(email, password) {    
    
        return this.httpService.post(this.api + `login?email=${email}&password=${encodeURIComponent(password)}`, null)
        .then((response) => {
            const u = response.data;
            if (u != null) {
                this.saveUser(u);
            }
            return response;    
        }).
        catch(e=> Promise.reject(e));
    }

    register(user, key) {
        return this.httpService.post(this.api + 'register?sessionKey=' + key , user)
    }

    validate(id) {
        return this.httpService.post(this.api + 'validate?id=' + id);
    }
    
    updateUser(user) {
        const url = user.id > 0 ? 'update' : 'create';
        return this.httpService.post(this.api + url, user);
    }
        
    checkUsername (id, username) {
        return this.httpService.post(this.api + 'checkusername?username=' + username + '&id=' + id, null);
    }
        
    deleteUser(id) {
    return this.httpService.delete(this.api + 'delete?id=' + id);
    }

    updatePassword(data) {
        return this.httpService.post(this.api + 'updatePassword', data);
    }

    forgotPass(email) {
        return this.httpService.post(this.api + 'forgotPass?email=' + email);
    }

    recoverPass(id) {
        return this.httpService.post(this.api + 'checkRecovery?id=' + id);
    }

    updatePassword(id, password, password2) {
        const passChangeData = {
            id: id,
            password: password,
            password2: password2
        }
        return this.httpService.post(this.api + 'updatePassword', passChangeData);
    }
}