import { makeObservable, observable, action } from 'mobx'
import { login } from '../apis/authApi';
import authStore from './authStore';


export class LoginStore {
  stayLogged = false;
  stayLoggedAsText = 'No';
  userName         = ''  ;
  userPasssword    = ''  ;

  constructor() {
    makeObservable(this, {
      stayLogged         : observable,
      stayLoggedAsText   : observable,
      userName           : observable,        
      userPasssword      : observable,
      onUserNameChanged  : action    ,
      onPasswordChanged  : action    , 
      onHandleStayLogged : action    ,
      onSubmitLogin      : action    ,
    });
  }
  
  onUserNameChanged = (event) =>
  {
    this.userName = event.target.value;
  }
  
  onPasswordChanged = (event) =>
  {
    this.userPasssword = event.target.value;
  }

  onSubmitLogin = async () => {
    try {
      const data = await login(this.userName, this.userPasssword, this.stayLogged);
      authStore.setToken(data.accessToken);
      authStore.setUser(data.user);
      if (this.stayLogged) {
        localStorage.setItem('SyphaxToken', data.accessToken);
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  onHandleStayLogged = (event) => 
  {
    this.stayLogged = event.target.checked ;
    this.stayLogged? this.stayLoggedAsText='Yes' : this.stayLoggedAsText = 'No'; 
    console.log("enter on handleStayLogged:"+this.stayLogged );
  }

}


