import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ignora erros inofensivos do WebSocket do Vite no ambiente de dev
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || '';
  if (message.includes('WebSocket') || message.includes('WebSocket closed')) {
    event.preventDefault();
  }
});

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const msg = args[0]?.toString() || '';
  if (
    msg.includes('failed to connect to websocket') || 
    msg.includes('WebSocket closed without opened') ||
    msg.includes('WebSocket is already in CLOSING or CLOSED state')
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const msg = args[0]?.toString() || '';
  if (msg.includes('[vite] failed to connect to websocket')) {
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
