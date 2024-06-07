import './App.css'
import SignInForm from './Components/SignInForm/SignInForm.jsx'
import DashBoard from './Components/DashBoard/DashBoard.jsx';
import { loginStore } from './mobxStores/loginStore.jsx';
import { observer } from 'mobx-react';


const App = observer(() => {
 return (
  <div>
     {loginStore.loginSucces ? (
          <DashBoard/>
        ) 
        : 
        (
          <SignInForm />
        )}
  </div>
 );
 

});

export default App
