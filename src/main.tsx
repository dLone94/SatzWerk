import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './ui/App.tsx';
import { AppStateProvider } from './state/AppState.tsx';
import { registerServiceWorker } from './services/offline/register.ts';
import './fonts.css';
import './styles.css';
import './studio.css';
import './playful.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

// Before rendering, but it does its work after load: the app must be openable
// in a tunnel, and that only holds if the worker is there before the tunnel.
registerServiceWorker();

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </BrowserRouter>
  </StrictMode>,
);
