import { makeObservable, observable, action } from 'mobx'


export class DashBoardStore {
    tabSheetIndex = 0;
  
constructor() {
    makeObservable(this, {
      tabSheetIndex         : observable,
      onHandleDashBoardTabsheetChanged : action
    });
  }

  onHandleDashBoardTabsheetChanged = (event, newValue) => {
    this.tabSheetIndex = newValue;
  };


  
  }
  