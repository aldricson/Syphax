import { makeObservable, observable, computed, action } from 'mobx'


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

  onSubmitLogin = () =>
  {

  }
  
  onHandleStayLogged = (event) => 
  {
    
    this.stayLogged = event.target.checked ;
    this.stayLogged? this.stayLoggedAsText='Yes' : this.stayLoggedAsText = 'No'; 
    console.log("enter on handleStayLogged:"+this.stayLogged );
  }

}


