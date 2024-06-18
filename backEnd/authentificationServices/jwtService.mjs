// role: This file handles JWT token generation, verification, and refresh token logic for user authentication.

import jwt from "jsonwebtoken"; // Importing the jsonwebtoken library for JWT operations
import fs from "fs/promises"; // Importing the file system promises API for reading files asynchronously
import path from "path"; // Importing the path module to handle file paths
import {
  cryptoAESDecryption, // Importing the AES decryption function from the crypto service module
  cryptoAESEncryption, // Importing the AES encryption function from the crypto service module
} from "./cryptoService.mjs"; // Specifying the relative path to the crypto service module

import { getUserByUserId } from "../db/authModel.mjs"; // Importing the function to get user data by user ID from the auth model
import { sendMessageToClient } from "../mainServer/websocketUtils.mjs"; // Importing the function to send messages to client via websocket
import { MESSAGE_EVENTS, MESSAGE_STRINGS } from "../globals/globalWebSocket.mjs"; // Import WebSocket constants


const rootDir = process.cwd(); // Getting the current working directory
const privateKeyPath = path.join(rootDir, "./certs/jwtRS256.key"); // Constructing the path to the private key file
const publicKeyPath = path.join(rootDir, "./certs/jwtRS256.key.pub"); // Constructing the path to the public key file
const privateKey = await fs.readFile(privateKeyPath); // Reading the private key from the file system asynchronously
const publicKey = await fs.readFile(publicKeyPath); // Reading the public key from the file system asynchronously

/**
 * Signs the provided data into a JWT token.
 *
 * @param {Object} data - The data to be included in the JWT token payload.
 * @param {number} [seconds=2592000] - The token expiration time in seconds (default is 30 days).
 * @returns {string|null} - The generated JWT token or null if an error occurs.
 */
export const sign = async (data, seconds = 30 * 60 * 60 * 24) => {
  if (!data) { // Checking if the data is provided
    return null; // Returning null if data is not provided
  }

  try {
    const options = { algorithm: "RS256", expiresIn: seconds }; // Setting the JWT options including algorithm and expiration time
    const token = jwt.sign({ payload: data }, privateKey, options); // Signing the JWT token with the private key and options
    return token; // Returning the generated token
  } catch (error) {
    console.error(error); // Logging any error that occurs during the token generation
    return null; // Returning null if an error occurs
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
