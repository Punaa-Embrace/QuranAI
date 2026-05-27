import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and ignore benign WebSocket complaints that are typical in sandboxed/iframe preview environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason) {
      const msg = typeof reason === 'string' ? reason : (reason.message || '');
      if (
        msg.includes('WebSocket') || 
        msg.includes('websocket') || 
        msg.includes('WebSocket closed') ||
        msg.includes('closed without opened')
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('WebSocket closed') ||
      msg.includes('closed without opened')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

