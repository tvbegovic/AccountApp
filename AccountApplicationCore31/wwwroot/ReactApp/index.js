import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Popper from 'popper.js';
import './index.css';
import 'babel-polyfill';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter} from 'react-router-dom';
import { Services, HttpService, UserService, AccountService } from './services';
import { BlockUIService } from './services/blockUiService';
import { OnlineFormService } from './services/onlineFormService';


const services = new Services();
services.blockUIService = new BlockUIService();
services.httpService = new HttpService(services.blockUIService);
services.userService = new UserService(services.httpService);
services.accountService = new AccountService(services.httpService);
services.onlineFormService = new OnlineFormService(services.httpService);

ReactDOM.render(
<BrowserRouter>
    <App services={services}/>
</BrowserRouter>
, document.getElementById('app'));
registerServiceWorker();