import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initSentry } from './utils/sentry';
import { validateFrontendEnv } from './utils/validateEnv';

// Validate environment variables
try {
  validateFrontendEnv();
} catch (error) {
  console.error('Failed to start app due to environment validation errors:', error);
  // Show error to user
  document.getElementById('root')!.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #09090b; color: #e4e4e7; font-family: system-ui, -apple-system, sans-serif;">
      <div style="text-align: center; max-width: 600px; padding: 2rem;">
        <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem;">⚠️ Configuration Error</h1>
        <p style="color: #a1a1aa; margin-bottom: 1rem;">The application is not properly configured. Please check the console for details.</p>
        <pre style="background: #18181b; padding: 1rem; border-radius: 0.5rem; text-align: left; overflow-x: auto; font-size: 0.875rem;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    </div>
  `;
  throw error;
}

// Initialize Sentry for error tracking
initSentry();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);