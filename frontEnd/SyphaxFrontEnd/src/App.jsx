import './App.css'
import SignInForm from './Components/SignInForm/SignInForm.jsx'
import DashBoard from './Components/DashBoard/DashBoard.jsx';
import { loginStore } from './mobxStores/loginStore.jsx';
import { observer } from 'mobx-react';
import socket from './webSockets/websocket.jsx';


const App = observer(() => {
 socket.connect();
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
