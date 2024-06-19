// role: Centralized file for WebSocket message events and strings.

/**
 * @module globalWebSocket
 * This module provides centralized constants for WebSocket message events and strings,
 * ensuring consistency and easier maintenance across different parts of the application.
 */

/**
 * Constants for WebSocket message events.
 * These constants represent the different types of WebSocket events that can be emitted.
 */
export const MESSAGE_EVENTS = {
  LOGIN_SUCCESS: 'loginSuccess', // Event for successful login
  LOGIN_FAILED: 'loginFailed', // Event for failed login
  TOKEN_EXPIRED: 'tokenExpired', // Event for expired access token
  NEW_DATA_READY: 'newDataReady', // Event for new data ready
};

/**
 * Constants for WebSocket message strings.
 * These constants represent the different message strings that can be sent with WebSocket events.
 */
export const MESSAGE_STRINGS = {
  LOGIN_SUCCESS: 'Login successful', // Message string for successful login
  LOGIN_FAILED: 'Login failed', // Message string for failed login
  TOKEN_EXPIRED: 'Your access token has expired', // Message string for expired access token
  NEW_DATA_READY: 'New data is ready', // Message string for new data ready
};
