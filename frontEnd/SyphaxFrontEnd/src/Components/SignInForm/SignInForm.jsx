// role: Provides the sign-in form component for user authentication.

// eslint-disable-next-line no-unused-vars
import React from 'react';
// Import StyledEngineProvider from MUI for styling
import { StyledEngineProvider } from '@mui/material/styles';
// Import the stylesheet for the SignInForm component
import '../../assets/styleSheets/signInForm.css';
// Import the SignInHeader component
import SignInHeader from './SignInHeader.jsx';
// Import observer from mobx-react to observe changes in MobX store
import { observer } from 'mobx-react';
// Import the loginStore from MobX to manage the login state
import { loginStore } from '../../mobxStores/loginStore.jsx';
// Import MUI components for the form
import {
  Checkbox,
  TextField,
  FormControlLabel,
  Paper,
  Button,
  Box
} from '@mui/material';

/**
 * SignInForm component.
 * 
 * This functional component renders a sign-in form for user authentication.
 * It uses MobX to manage the state and MUI for styling and form elements.
 * 
 * @returns {JSX.Element} The rendered sign-in form component.
 */
const SignInForm = observer(function SignInForm() {
  return (
    <div>
      {/* Display error message if there is any */}
      <Box
        id="loginErrorTextField"
        sx={{
          color: 'red',
          border: loginStore.errorBorder,
          textAlign: 'center',
          padding: '8px',
          marginBottom: '16px',
        }}
      >
        {loginStore.errorText}
      </Box>
      
      {/* Paper component to contain the form elements */}
      <Paper className="GridContainer">
        
        {/* Render the SignInHeader component */}
        <SignInHeader/>

        {/* TextField for user email input */}
        <TextField 
          className="UserField"
          label="User e-mail"
          onChange={loginStore.onUserEmailChanged}
        />
        
        {/* TextField for password input */}
        <TextField 
          className="passwordField" 
          label="Password" 
          type="password"
          onChange={loginStore.onPasswordChanged}
        />
        
        {/* FormControlLabel for the 'Keep me logged in' checkbox */}
        <FormControlLabel 
          className="rememberMeField"
          control={
            <Checkbox
              onChange={loginStore.onHandleStayLogged}
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
          }
          label="Keep me logged in"
        />
        
        {/* Button to submit the login form */}
        <StyledEngineProvider>
          <Button 
            className="LoginButton" 
            variant="contained" 
            onClick={loginStore.onSubmitLogin}
          > 
            Login 
          </Button>
        </StyledEngineProvider> 
      </Paper>
    </div>
  );
});

// Export the SignInForm component as the default export
export default SignInForm;
