import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

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

// Register service worker for PWA offline support
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('SW registered successfully:', registration);
  },
  onUpdate: (registration) => {
    console.log('New content available, please refresh:', registration);
    // You can show a notification to the user here
    const updateEvent = new CustomEvent('swUpdateAvailable', {
      detail: registration,
    });
    window.dispatchEvent(updateEvent);
  },
  onOffline: () => {
    console.log('App is running offline');
  },
  onOnline: () => {
    console.log('App is back online');
  },
});
