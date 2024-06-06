// eslint-disable-next-line no-unused-vars
import React from 'react';
import { StyledEngineProvider } from '@mui/material/styles';
import '../../assets/styleSheets/signInForm.css'
import SignInHeader from './SignInHeader.jsx'
import { observer } from 'mobx-react';
import { loginStore } from '../../mobxStores/loginStore.jsx';
import {
  Checkbox,
  TextField,
  FormControlLabel,
  Paper,
  Button,
  Box
} from '@mui/material';



const SignInForm = observer(function SignInForm() {
    return (
        <div>   
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
                
                
                <Paper className="GridContainer">
                
    
                    <SignInHeader/>

                    <TextField className = "UserField"
                               label     = "Username"
                               onChange={loginStore.onUserNameChanged}>        
                    </TextField>

                    <TextField className = "passwordField" 
                               label     = "Password" 
                               type      = {'password'}
                               onChange  = {loginStore.onPasswordChanged}>
                    </TextField>
    
                    <FormControlLabel className="rememberMeField"
                        control=
                        {
                            <Checkbox
                                //checked={checked}
                                onChange={loginStore.onHandleStayLogged}
                                label={'Keep me logged in'}
                                inputProps={{ 'aria-label': 'primary checkbox' }}
        
                            />
                        }
                        label="Keep me logged in"
                    />
                    <StyledEngineProvider>
                        <Button className="LoginButton" variant="contained" onClick={loginStore.onSubmitLogin}> Login </Button>
                    </StyledEngineProvider> 
                </Paper>
            </div>
        )
})

export default SignInForm;





