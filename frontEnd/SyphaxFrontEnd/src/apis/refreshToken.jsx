// role: Contains the function to refresh the access token using the refresh token.

import { LOGIN_API_URL } from '../globals/globals'; // Import the login API URL from the global constants

/**
 * Refreshes the access token using the refresh token.
 *
 * @returns {Promise<Object>} The response data containing the new access token and user data.
 */
export const refreshAccessToken = async () => {
  try {
    // Send a POST request to the refresh token endpoint to obtain a new access token
    const response = await fetch(`${LOGIN_API_URL}/refreshToken`, {
      method: 'POST', // Use the POST method for the request
      credentials: 'include', // Include credentials (cookies) in the request
      headers: {
        'Content-Type': 'application/json' // Set the content type to JSON
      }
    });

    // Check if the response status is not OK (status code is not in the range 200-299)
    if (!response.ok) {
      throw new Error('Failed to refresh access token'); // Throw an error if the request failed
    }

    // Parse the response data as JSON
    const data = await response.json();
    return data; // Return the parsed data containing the new access token and user data
  } catch (error) {
    console.error('Error refreshing access token:', error); // Log any errors that occur during the request
    throw error; // Rethrow the error to be handled by the caller
  }
};
