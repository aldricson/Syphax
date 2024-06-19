// role: This file handles user authentication, verifying credentials, generating tokens, and refreshing tokens.

// Importing bcrypt library for password hashing and comparison.
import bcrypt from "bcrypt";

// Importing sign and verifyToken functions from jwtService to generate and verify JWT tokens.
import { sign, verifyToken } from "./jwtService.mjs";

// Importing AES encryption and decryption functions from cryptoService.
import { cryptoAESEncryption, cryptoAESDecryption } from "./cryptoService.mjs";

// Importing functions to get user by email and ID from the database model.
import { getUserByEmail, getUserByUserId } from "../db/authModel.mjs";

// Importing UI functions to display messages in the terminal.
import { displayError, displayMenu, displaySucces } from "../terminalUi/terminalUi.mjs";

// Importing function to send messages to client via websocket.
import { sendMessageToClient } from "../mainServer/websocketUtils.mjs";
import { MESSAGE_EVENTS, MESSAGE_STRINGS } from "../globals/globalWebSocket.mjs"; // Import WebSocket constants

// Importing function to get and validate native program credentials.
import { getNativeProgramByKey } from "../db/nativeProgramModel.mjs";

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
      sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_FAILED, MESSAGE_STRINGS.LOGIN_FAILED); // Send message to client
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
        sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_FAILED, MESSAGE_STRINGS.LOGIN_FAILED); // Send message to client
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
        sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_FAILED, MESSAGE_STRINGS.LOGIN_FAILED); // Send message to client
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
    const encUser = await cryptoAESEncryption(JSON.stringify(userData)).catch(() => null);
    const encUserId = await cryptoAESEncryption(user.u_user_id).catch(() => null);

    displaySucces(false, '\n\nEncrypted data:\n'); // Display encrypted data success message
    displaySucces(false, encUser); // Display encrypted user data
    displaySucces(false, '\nEncrypted ID:\n'); // Display encrypted ID success message
    displaySucces(false, encUserId); // Display encrypted user ID

    // Generate refresh and access tokens
    const refreshToken = await sign(encUserId, expiryTime).catch(() => null); // 1 day expiration for refresh token
    const accessToken = await sign(encUser, 2 * 60).catch(() => null); // 2 minutes expiration for access token

    await displayMenu(true); // Display menu

    // Send success message to the client
    if (socketId) {
      sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_SUCCESS, MESSAGE_STRINGS.LOGIN_SUCCESS); // Send message to client
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
      sendMessageToClient(socketId, MESSAGE_EVENTS.LOGIN_FAILED, MESSAGE_STRINGS.LOGIN_FAILED); // Send message to client
    }
    return null; // Return null indicating failure
  }
}

/**
 * Authenticates a native program by verifying its credentials and generates tokens.
 * 
 * @param {string} programKey - The key of the native program to authenticate.
 * @param {string} secret - The secret of the native program to authenticate.
 * @param {number} expiryTime - The expiration time for the refresh token.
 * @returns {Object|null} - Returns an object with tokens and program data if authentication is successful, otherwise null.
 */
export async function authenticateNativeProgram(programKey, secret, expiryTime) {
  // Check if programKey, secret, or expiryTime is missing
  if (!programKey || !secret || !expiryTime) {
    displayError(true, 'Program cannot be identified'); // Display error message
    return null; // Return null indicating failure
  }

  try {
    // Fetch program details by key
    const program = await getNativeProgramByKey(programKey);
    const dbSecret = program.secret; // Get secret hash from program data
    if (program.program_key !== programKey || !dbSecret) {
      displayError(false, '\nWrong program key or secret is null\n'); // Display error for wrong key or missing secret
      return null; // Return null indicating failure
    }

    // Compare provided secret with stored hash
    const verified = await bcrypt.compare(secret, dbSecret).catch(() => false);

    if (!verified) {
      displayError('\nSecret not verified\n'); // Display error if secret verification fails
      return null; // Return null indicating failure
    }

    // Prepare program data for token generation
    const programData = {
      id: program.program_id,
      name: program.program_name,
    };

    displaySucces(false, '\nProgram data:\n'); // Display program data success message
    displaySucces(false, JSON.stringify(programData)); // Display program data

    // Encrypt program data and program ID
    const encProgram = await cryptoAESEncryption(JSON.stringify(programData)).catch(() => null);
    const encProgramId = await cryptoAESEncryption(program.program_id).catch(() => null);

    displaySucces(false, '\n\nEncrypted data:\n'); // Display encrypted data success message
    displaySucces(false, encProgram); // Display encrypted program data
    displaySucces(false, '\nEncrypted ID:\n'); // Display encrypted ID success message
    displaySucces(false, encProgramId); // Display encrypted program ID

    // Generate refresh and access tokens
    const refreshToken = await sign(encProgramId, expiryTime).catch(() => null); // 1 day expiration for refresh token
    const accessToken = await sign(encProgram, 2 * 60).catch(() => null); // 2 minutes expiration for access token

    // Return tokens and program data indicating successful authentication
    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
      program: programData,
      authenticated: true,
    };
  } catch (error) {
    displayError(error); // Display error if exception occurs
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
        sendMessageToClient(socketId, MESSAGE_EVENTS.TOKEN_EXPIRED, MESSAGE_STRINGS.TOKEN_EXPIRED); // Send message to client
      }
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error(error); // Logging any error that occurs during token verification
    return null; // Returning null if verification fails
  }
};

/**
 * Verifies the refresh token and generates a new access token if valid.
 *
 * @param {Object} req - The HTTP request object containing headers and cookies.
 * @param {string} socketId - The socket ID of the client for WebSocket communication.
 * @returns {Object} - The response data containing authentication status, updated token, and user data.
 */
export const verifyRefreshToken = async (req, socketId) => {
  let userData = null; // Initializing userData as null

  const responseData = { // Initializing the response data object
    authStatus: 0, // Default authentication status (0: not authenticated)
    updatedToken: false, // Default updated token status (false: token not updated)
    data: {
      accessToken: null, // Placeholder for the access token
      userData: null, // Placeholder for the user data
    },
  };

  let accessTok =
    req.headers?.authorization && req.headers?.authorization.split(" ")[1] // Checking if the authorization header is present
      ? req.headers?.authorization.split(" ")[1] // Extracting the token from the authorization header
      : ""; // Defaulting to an empty string if no token is found

  const refreshTok = req.cookies?.yttmrtck; // Extracting the refresh token from the cookies

  if (!accessTok && !refreshTok) { // Checking if both access token and refresh token are absent
    return responseData; // Returning the default response data
  }

  const accessTokenValid = verifyToken(accessTok, socketId); // Verifying the access token

  if (!accessTokenValid || !accessTokenValid.payload) { // Checking if the access token is invalid or has no payload
    const refreshTokenValid = verifyToken(refreshTok, socketId); // Verifying the refresh token
    if (refreshTokenValid && refreshTokenValid.payload) { // Checking if the refresh token is valid and has a payload
      const userDec = await cryptoAESDecryption(
        refreshTokenValid.payload
      ).catch(() => null); // Decrypting the user data from the refresh token payload

      if (userDec) { // Checking if the user data decryption was successful
        const user = await getUserByUserId(userDec); // Fetching the user data by user ID
        if (user) { // Checking if the user data was retrieved successfully
          const userData = { // Constructing the user data object
            id: user.u_user_id, // User ID
            name: user.u_name, // User name
            email: user.u_email, // User email
            mobile: user.u_mobile, // User mobile
            image: user.u_image, // User image
          };

          const encUser = await cryptoAESEncryption(
            JSON.stringify(userData)
          ).catch(() => null); // Encrypting the user data

          const accessToken = await sign(encUser, 2 * 60).catch(() => null); // Generating a new access token with a short expiry

          responseData.updatedToken = true; // Updating the token status in the response data
          responseData.authStatus = 1; // Updating the authentication status in the response data
          responseData.data.accessToken = accessToken; // Setting the new access token in the response data
          responseData.data.userData = userData; // Setting the user data in the response data
          return responseData; // Returning the updated response data
        }
      }
    }
  } else {
    userData = await cryptoAESDecryption(accessTokenValid.payload).catch(
      () => null
    ); // Decrypting the user data from the access token payload
  }

  if (accessTokenValid && userData) { // Checking if the access token is valid and user data is available
    responseData.authStatus = 1; // Updating the authentication status in the response data
    responseData.data.accessToken = accessTok; // Setting the current access token in the response data
    responseData.data.userData = userData; // Setting the user data in the response data
  }

  return responseData; // Returning the final response data
};
