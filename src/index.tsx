import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function applyGlobalTheme() {
  fetch('/api/theme')
    .then(res => res.json())
    .then(theme => {
      if (theme) {
        document.documentElement.style.setProperty('--ashram-primary', theme.primary_color);
        document.documentElement.style.setProperty('--ashram-accent', theme.accent_color);
        document.documentElement.style.setProperty('--ashram-pink', theme.pink_color);
        document.documentElement.style.setProperty('--ashram-light', theme.light_color);
      }
    });
}

applyGlobalTheme();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
