import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: '16px',
          background: '#0f172a',
          color: '#f8fafc',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } },
        error: { iconTheme: { primary: '#f43f5e', secondary: '#0f172a' } },
      }}
    />
  </React.StrictMode>
);
