// role: Custom hook to check the authentication status and handle logging out if the token is invalid.

import { useEffect } from 'react'; // Import useEffect for performing side effects in functional components
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import authStore from '../mobxStores/authStore'; // Import the authentication store

/**
 * Custom hook to check the authentication status.
 * 
 * This hook performs the authentication check and handles logging out the user if the token is invalid.
 * 
 * @returns {string|null} The current authentication token or null if not authenticated.
 */
const useAuthCheck = () => {
  const navigate = useNavigate(); // Use the useNavigate hook to navigate programmatically

  useEffect(() => {
    const checkAuth = async () => {
      if (!authStore.token) { // Check if there is no token
        authStore.logout(); // Logout the user
        navigate('/login'); // Redirect to login page
      } else {
        try {
          const response = await fetch('http://localhost:5010/api/auth/verifyToken', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authStore.token}`
            }
          });
          if (!response.ok) { // If the response is not ok, throw an error
            throw new Error('Token validation failed');
          }
        } catch (error) {
          console.error('Token validation error', error); // Log the error
          authStore.logout(); // Logout the user
          navigate('/login'); // Redirect to login page
        }
      }
    };

    checkAuth(); // Call the checkAuth function when the component mounts
  }, [navigate]); // Dependency array to re-run the effect when navigate changes

  return authStore.token; // Return the current token
};

export default useAuthCheck; // Export the custom hook
