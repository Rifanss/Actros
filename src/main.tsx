import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initMobileAppExperience } from './utils/mobileAppExperience';
import { initGlobalScrollRestoration } from './utils/scrollUtils';

// Initialize mobile app experience, viewport lock, and zoom prevention
initMobileAppExperience();

// Initialize global scroll restoration and ensure all pages/views start at top (0, 0)
initGlobalScrollRestoration();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

