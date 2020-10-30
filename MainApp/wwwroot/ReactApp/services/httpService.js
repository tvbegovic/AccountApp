import axios from 'axios';
import { Settings } from '../settings';


export class HttpService {

    constructor(blockUIService) {        
        this.axios = axios.create();
        //this._responseInterceptorFn = responseInterceptorFn;
        this.blockUIService = blockUIService;
        
    }
    

    post(url, object) {

        this.startBlock();

        return this.axios.post(url, object, {headers: this.BuildHeaders()})
        .then(response => { this.stopBlock(); return response;})
        .catch(err => { this.stopBlock(); return Promise.reject(err)}); 
    }

    startBlock() {
        if(this.blockUIService != null) {
            this.blockUIService.startBlock();
        } 
    }

    stopBlock() {
        if(this.blockUIService != null) {
            this.blockUIService.stopBlock();
        }
    }

    postNoBlock(url, object) {
        return this.axios.post(url, object, {headers: this.BuildHeaders()});
    }

    get(url, options) {
          
        this.startBlock();
          
        if (options == null) {
            options = {};
        }  
  
        options.headers = this.BuildHeaders();
  
        return this.axios.get(url, options)
        .then(response => { this.stopBlock(); return response;})
        .catch(err => { this.stopBlock(); return Promise.reject(err)});
    }

    delete(url) {
        this.startBlock();
        return this.axios.delete(url, {headers: this.BuildHeaders()})
        .then(response => { this.stopBlock(); return response;})
        .catch(err => { this.stopBlock(); return Promise.reject(err)});
    }

    BuildHeaders() {
        let headers = {};
        headers['Content-Type'] = 'application/json; charset=utf-8';
        headers['Accept'] = 'q=0.8;application/json;q=0.9';
  
        if (typeof (Storage) !== 'undefined') {
  
            const token = localStorage.getItem(Settings.tokenKey);
            if (token != null) {
              headers['Authorization'] = 'Bearer ' + token;
            }
  
        }
        return headers;
    }
}