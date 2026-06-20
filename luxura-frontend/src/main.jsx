import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Your Tailwind v4 CSS layer file

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)