import { makeObservable, observable, computed, action } from 'mobx'

export default class PlayGroundStore {
    buttonState = false;
    buttonStateAsText = 'No';

  
    constructor() {
      makeObservable(this, {
        buttonState         : observable,
        buttonStateAsText   : observable,
        onButtonClicked      : action    ,
      });
    }
  
    
    onButtonClicked = () =>
    {
      this.buttonState = true;
      this.buttonStateAsText = 'Yes';
    }
   
  
  }