import { Settings } from "../settings";
import moment from 'moment';

/*
    set object value recursively e.g. strPropNames could be loginData.username,
    result is
    {
        loginData: {
            username: value
        }
    }
*/
const SetObjValue = (data, value, strPropNames) => {
    let obj = data;
    const propNames = strPropNames.split('.');        
    for (let i = 0; i < propNames.length; i++) {
        const element = propNames[i];
        if(i < propNames.length -1) {
            if(!(element in obj))
                obj[element] = {};
            obj = obj[element];
        } else {
            obj[element] = value;
        }
    }
    return data;
};

const getError = (err) => {
    if (err.error instanceof Error) {
        return err.error.message;
    }
  
    if (typeof(err.error) === 'string') {
        return err.error;
    }
    if(err.response) {
        return err.response.data.message;
    }
};

const formatDate = (d) => {
    if(d == null)
        return '';
    return moment(d).format(Settings.dateFormatnoTime);
}

const formatDateTime = (d) => {
    if(d == null)
        return '';
    return moment(d).format(Settings.dateFormatwTime);
}

const getSubjectName = r => {
    return r.subject != null ? r.subject.name : r.subjectText;
}


const validateEmail = email => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
}

const getBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }


export {SetObjValue, getError, formatDate, formatDateTime, getSubjectName, validateEmail, getBase64};