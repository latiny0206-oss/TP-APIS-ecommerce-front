import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NavigationProvider } from './context/NavigationContext.jsx'
import { CartProvider }       from './context/CartContext.jsx'
import { AuthProvider }       from './context/AuthContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NavigationProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </NavigationProvider>
  </StrictMode>,
)
