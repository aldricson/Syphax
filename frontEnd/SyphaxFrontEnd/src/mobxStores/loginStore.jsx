import { makeObservable, observable, action, runInAction } from 'mobx';
import { login } from '../apis/authApi';
import authStore from './authStore';

export class LoginStore {
  stayLogged = false;
  loginSucces = false;
  stayLoggedAsText = 'No';
  userName = '';
  userPasssword = '';
  errorText = '';
  errorBorder = '0px';

  constructor() {
    makeObservable(this, {
      stayLogged: observable,
      stayLoggedAsText: observable,
      userName: observable,
      userPasssword: observable,
      errorText: observable,
      errorBorder: observable,
      loginSucces: observable,
      onUserNameChanged: action,
      onPasswordChanged: action,
      onHandleStayLogged: action,
      onSubmitLogin: action,
    });
  }

  onUserNameChanged = (event) => {
    this.userName = event.target.value;
  };

  onPasswordChanged = (event) => {
    this.userPasssword = event.target.value;
  };

  onSubmitLogin = async () => {
    try {
      const data = await login(this.userName, this.userPasssword, this.stayLogged);
      runInAction(() => {
        authStore.setToken(data.accessToken);
        authStore.setUser(data.user);
        if (this.stayLogged) {
          localStorage.setItem('SyphaxToken', data.accessToken);
        }
        this.errorText = '';
        this.errorBorder = '0px';
        this.loginSucces = true;
      });
    } catch (error) {
      runInAction(() => {
        this.errorText = 'Login Failed !';
        this.errorBorder = '1px solid red';
        this.loginSucces = false;
      });
      console.error('Login failed', error);
    }
  };

  onHandleStayLogged = (event) => {
    this.stayLogged = event.target.checked;
    this.stayLogged ? (this.stayLoggedAsText = 'Yes') : (this.stayLoggedAsText = 'No');
    console.log('enter on handleStayLogged:' + this.stayLogged);
  };
}

export const loginStore = new LoginStore();
