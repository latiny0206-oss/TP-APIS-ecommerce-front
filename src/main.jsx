import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import { ProductsProvider } from './context/ProductsContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ProductsProvider>
          <App />
        </ProductsProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
