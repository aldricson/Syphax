// role: This file handles user authentication, verifying credentials and generating tokens.

// Importing bcrypt library for password hashing and comparison
import bcrypt from "bcrypt";
// Importing sign function from jwtService to generate JWT tokens
import { sign } from "./jwtService.mjs";
// Importing AES encryption function from cryptoService
import { cryptoAESEncryption } from "./cryptoService.mjs";
// Importing function to get user by email from the database model
import { getUserByEmail } from "../db/authModel.mjs";
// Importing UI functions to display messages in the terminal
import { displayError, displayMenu, displaySucces } from "../terminalUi/terminalUi.mjs";
// Importing function to send messages to client via websocket
import { sendMessageToClient } from "../mainServer/websocketUtils.mjs";
import { MESSAGE_EVENTS, MESSAGE_STRINGS } from "../globals/globalWebSocket.mjs"; // Import WebSocket constants


/**
 * Authenticates a user by verifying email and password, and generates tokens.
 * 
 * @param {string} email - The email of the user to authenticate.
 * @param {string} password - The password of the user to authenticate.
 * @param {number} expiryTime - The expiration time for the refresh token.
 * @param {string} socketId - The socket ID of the client for WebSocket communication.
 * @returns {Object|null} - Returns an object with tokens and user data if authentication is successful, otherwise null.
 */
export async function authenticateUser(email, password, expiryTime, socketId) {
  // Check if email, password, or expiryTime is missing
  if (!email || !password || !expiryTime) {
    displayError(true, 'User cannot be identified'); // Display error message
    if (socketId) {
      sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_FAILED, MESSAGE_STRINGS.LOGIN_FAILED);
    }
    return null; // Return null indicating failure
  }

  try {
    // Fetch user details by email
    const user = await getUserByEmail(email);
    const dbHash = user.u_password; // Get password hash from user data
    displaySucces(true, 'Password hash:\n'); // Display success message
    displaySucces(false, dbHash); // Display the password hash
    if (user.u_email !== email || !dbHash) {
      displayError(false, '\nWrong email or password is null\n'); // Display error for wrong email or missing password
      if (socketId) {
        sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_FAILED, MESSAGE_STRINGS.LOGIN_FAILED);
      }
      return null; // Return null indicating failure
    }

    // Replace PHP hash prefix to be compatible with bcrypt
    const hash = dbHash.replace(/^\$2y(.+)$/i, "$2b$1");
    // Compare provided password with stored hash
    const verified = await bcrypt.compare(password, hash).catch(() => false);

    if (!verified) {
      displayError('\nPassword not verified\n'); // Display error if password verification fails
      if (socketId) {
        sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_FAILED, MESSAGE_STRINGS.LOGIN_FAILED);
      }
      return null; // Return null indicating failure
    }

    // Prepare user data for token generation
    const userData = {
      id: user.u_user_id,
      name: user.u_name,
      email: user.u_email,
      mobile: user.u_mobile,
      image: user.u_image,
    };
    displaySucces(false, '\nUser data:\n'); // Display user data success message
    displaySucces(false, JSON.stringify(userData)); // Display user data
    displaySucces(false, '\n\nUser ID:\n'); // Display user ID success message
    displaySucces(false, JSON.stringify(user.u_user_id)); // Display user ID

    // Encrypt user data and user ID
    const encUser = await cryptoAESEncryption(JSON.stringify(userData)).catch(
      () => null
    );
    const encUserId = await cryptoAESEncryption(user.u_user_id).catch(
      () => null
    );

    displaySucces(false, '\n\nEncrypted data:\n'); // Display encrypted data success message
    displaySucces(false, encUser); // Display encrypted user data
    displaySucces(false, '\nEncrypted ID:\n'); // Display encrypted ID success message
    displaySucces(false, encUserId); // Display encrypted user ID

    // Generate refresh and access tokens
    // 1 day expiration for refresh token
    const refreshToken = await sign(encUserId, expiryTime).catch(() => null);
    // 2 minutes expiration for access token
    const accessToken = await sign(encUser, 2 * 60).catch(() => null);
    await displayMenu(true); // Display menu

    // Send success message to the client
    if (socketId) {
      sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_SUCCESS, MESSAGE_STRINGS.LOGIN_SUCCESS);
    }

    // Return tokens and user data indicating successful authentication
    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
      user: userData,
      authenticated: true,
    };
  } catch (error) {
    displayError(error); // Display error if exception occurs
    if (socketId) {
      sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_FAILED, MESSAGE_STRINGS.LOGIN_FAILED);
    }
    return null; // Return null indicating failure
  }
}

/**
 * Verifies the provided JWT token and sends a message if it is expired.
 *
 * @param {string} token - The JWT token to verify.
 * @param {string} socketId - The socket ID of the client for WebSocket communication.
 * @returns {Object|null} - The decoded token payload or null if verification fails.
 */
export const verifyTokenAndNotify = (token, socketId) => {
  if (!token) { // Checking if the token is provided
    return null; // Returning null if token is not provided
  }

  try {
    const decodedToken = jwt.verify(token, publicKey, { algorithm: "RS256" }); // Verifying the token with the public key and algorithm

    // If token is expired, send a WebSocket message
    if (Date.now() >= decodedToken.exp * 1000) {
      if (socketId) {
        sendMessageToClient(socketId, MESSAGE_EVENTS.TOKEN_EXPIRED, MESSAGE_STRINGS.TOKEN_EXPIRED);
      }
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error(error); // Logging any error that occurs during token verification
    return null; // Returning null if verification fails
  }
};
