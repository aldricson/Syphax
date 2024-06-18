// role: Entry point for the React application, responsible for rendering the main App component.

/**
 * Import React library for building user interfaces.
 * @module React
 */
import React from 'react';

/**
 * Import ReactDOM for rendering React components into the DOM.
 * @module ReactDOM
 */
import ReactDOM from 'react-dom/client';

/**
 * Import the main App component.
 * @module App
 */
import App from './App.jsx';

/**
 * Import the global stylesheet for the application.
 * @module styles
 */
import './index.css';

/**
 * Render the React application into the DOM.
 * 
 * This method creates a root DOM node, attaches the React application to it,
 * and renders the main App component inside a strict mode environment.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode is a wrapper component that helps with identifying potential problems in the application.
  <React.StrictMode>
    {/* Render the main App component */}
    <App />
  </React.StrictMode>,
);
