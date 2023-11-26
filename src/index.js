import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './assets/third-party/apex-chart.css';
import reportWebVitals from './reportWebVitals';
import registerServiceWorker from "./serviceWorkerRegistration";

const container = document.getElementById('root');
// createRoot(container!) if you use TypeScript
const root = createRoot(container);
root.render(
  // <StrictMode>
    <BrowserRouter basename="">
      <App />
    </BrowserRouter>
  // </StrictMode>
);

reportWebVitals();
registerServiceWorker();