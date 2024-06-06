import { makeObservable, observable, action } from 'mobx';

class CustomTabStore {
  value = 0;

  constructor() {
    makeObservable(this, {
      value: observable,
      setValue: action,
    });
  }

  setValue(newValue) {
    this.value = newValue;
  }
}

const tabStore = new CustomTabStore();
export default tabStore;
