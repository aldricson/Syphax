import './App.css'
import SignInForm from './Components/SignInForm/SignInForm.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {

  return (
<Router>
<Routes>
  <Route path="/login" element={<SignInForm />} />
  {/* Add more routes here as needed */}
</Routes>
</Router>

  )
}

export default App
