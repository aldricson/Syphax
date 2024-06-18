// role: Configuration file for Vite, setting up the build and development environment for the Syphax frontend application.

import { defineConfig } from 'vite'; // Import defineConfig function from Vite for creating configuration objects
import reactSupport from '@vitejs/plugin-react'; // Import the React plugin for Vite to enable React support

/**
 * Vite configuration.
 * 
 * This configuration file sets up the Vite build tool for the Syphax frontend application.
 * It includes support for React, Babel parser options for decorators and class properties, and specifies the development server port.
 * 
 * @module vite.config
 */
export default defineConfig({
  plugins: [
    reactSupport({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties'] // Enable legacy decorators and class properties support in Babel
        }
      }
    })
  ],
  server: {
    port: 5173 // Set the development server to run on port 5173
  }
});
