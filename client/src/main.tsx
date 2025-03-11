import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "bootstrap/dist/css/bootstrap.min.css";
// import { ToastProvider } from './components/utilities/toast.provider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <ToastProvider> */}
        <App />
    {/* </ToastProvider> */}
  </StrictMode>,
)
