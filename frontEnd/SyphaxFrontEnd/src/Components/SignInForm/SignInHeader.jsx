// role: Provides a basic header for a login box.

// Import React to create the component
// eslint-disable-next-line no-unused-vars
import React from 'react';
// Import the stylesheet for the SignInHeader component
import '../../assets/styleSheets/signInHeader.css';

/**
 * SignInHeader component.
 * 
 * This functional component renders a header for the login box,
 * including a logo and a title.
 * 
 * @returns {JSX.Element} The rendered header component.
 */
const SignInHeader = () => {
    return (
        <div className="SignInHeaderContainer">
            {/* Logo image for the header */}
            <img className="Logo" src="src/assets/Images/logoElyteq.png" alt="Elyteq Logo" />
            
            {/* Title for the header */}
            <div className="Title">Elyeq Syphax Gateway</div>
        </div>
    );
};

// Export the SignInHeader component as the default export
export default SignInHeader;
