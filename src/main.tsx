import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { createLogger } from './lib/logger';
import './styles/global.css';

const logger = createLogger('app');

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element in index.html');

createRoot(container, {
  onUncaughtError: (error, info) => logger.error('Uncaught render error', { error, componentStack: info.componentStack }),
  onRecoverableError: (error) => logger.warn('Recoverable render error', error),
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
