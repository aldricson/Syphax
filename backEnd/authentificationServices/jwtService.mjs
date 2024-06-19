// Importing necessary modules for JWT operations, file handling, and path manipulation
import jwt from "jsonwebtoken"; // JWT library for token generation and verification
import fs from "fs/promises"; // File system module with promise support for async operations
import path from "path"; // Path module for handling and transforming file paths

// Importing custom crypto functions for AES encryption and decryption
import { cryptoAESDecryption, cryptoAESEncryption } from "./cryptoService.mjs"; 

// Importing function to get user data by user ID from the auth model
import { getUserByUserId } from "../db/authModel.mjs"; 

// Importing function to send messages to clients via WebSocket
import { sendMessageToClient } from "../mainServer/websocketUtils.mjs"; 

// Importing WebSocket message events and strings constants
import { MESSAGE_EVENTS, MESSAGE_STRINGS } from "../globals/globalWebSocket.mjs"; 

// Getting the current working directory of the project
const rootDir = process.cwd(); 

// Constructing paths to the private and public key files used for signing and verifying JWTs
const privateKeyPath = path.join(rootDir, "./certs/jwtRS256.key"); 
const publicKeyPath = path.join(rootDir, "./certs/jwtRS256.key.pub");

// Reading the private and public key files asynchronously
const privateKey = await fs.readFile(privateKeyPath);
const publicKey = await fs.readFile(publicKeyPath);

/**
 * Signs the provided data into a JWT token.
 *
 * @param {Object} data - The data to be included in the JWT token payload.
 * @param {number} [seconds=2592000] - The token expiration time in seconds (default is 30 days).
 * @returns {string|null} - The generated JWT token or null if an error occurs.
 */
export const sign = async (data, seconds = 30 * 60 * 60 * 24) => {
  if (!data) { // Check if data is provided
    return null; // Return null if no data is provided
  }

  try {
    const options = { algorithm: "RS256", expiresIn: seconds }; // JWT options including algorithm and expiration time
    const token = jwt.sign({ payload: data }, privateKey, options); // Signing the JWT token with the private key and options
    return token; // Return the generated token
  } catch (error) {
    console.error(error); // Log any error that occurs during the token generation
    return null; // Return null if an error occurs
  }
};

/**
 * Verifies the provided JWT token.
 *
 * @param {string} token - The JWT token to verify.
 * @param {string} socketId - The socket ID of the client for WebSocket communication.
 * @returns {Object|null} - The decoded token payload or null if verification fails.
 */
export const verifyToken = (token, socketId) => {
  if (!token) { // Check if the token is provided
    return null; // Return null if token is not provided
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

    return decodedToken; // Return the decoded token payload
  } catch (error) {
    console.error(error); // Log any error that occurs during token verification
    return null; // Return null if verification fails
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
