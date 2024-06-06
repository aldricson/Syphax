// src/mobxStores/authStore.jsx
import { makeObservable, observable, action } from 'mobx';

class AuthStore {
  token = localStorage.getItem('SyphaxToken') || null;
  user = null;

  constructor() {
    makeObservable(this, {
      token: observable,
      user: observable,
      setToken: action,
      setUser: action,
      logout: action,
    });
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('SyphaxToken', token);
    } else {
      localStorage.removeItem('SyphaxToken');
    }
  }

  setUser(user) {
    this.user = user;
  }

  logout() {
    this.setToken(null);
    this.setUser(null);
  }
}

const authStore = new AuthStore();
export default authStore;
