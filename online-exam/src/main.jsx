// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './style.css'
import App from './App.jsx'
import config from './config.js'

// Initialize configuration before rendering
const initializeApp = async () => {
  try {
    await config.initialize();

    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <GoogleOAuthProvider clientId="123243172421-28rsh7uj9gjiiimsa0r55tcjgc0qq2if.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </StrictMode>,
    )
  } catch (error) {
    console.error('Failed to initialize app configuration:', error);
    // Fallback render without config initialization
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <GoogleOAuthProvider clientId="123243172421-28rsh7uj9gjiiimsa0r55tcjgc0qq2if.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </StrictMode>,
    )
  }
};

initializeApp();
