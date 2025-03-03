import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { checkIndexedDBSupport } from './lib/db-helper.ts'

// Verificar suporte ao IndexedDB antes de renderizar a aplicação
checkIndexedDBSupport()
  .then(isSupported => {
    if (!isSupported) {
      console.warn('IndexedDB não está funcionando corretamente. Alguns recursos podem não funcionar.');
    }
    
    // Renderizar a aplicação de qualquer forma
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    )
  })
  .catch(error => {
    console.error('Erro ao verificar suporte ao IndexedDB:', error);
    
    // Renderizar a aplicação mesmo com erro
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    )
  })
