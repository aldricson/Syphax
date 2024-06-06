import './App.css'
import SignInForm from './Components/SignInForm/SignInForm.jsx'
import DashBoard from './Components/DashBoard/DashBoard.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import  ProtectedRoute  from './Components/ProtectedRoutes/ProtectedRoute.jsx'
import { loginStore } from './mobxStores/loginStore.jsx';
import { observer } from 'mobx-react';


const App = observer(() => {
  return (
    <Router>
      <Routes>
        {loginStore.loginSuccess ? (
          <Route path="/" element={<ProtectedRoute component={DashBoard} />} />
        ) : (
          <Route path="/" element={<SignInForm />} />
        )}
      </Routes>
    </Router>
  );
});

export default App
