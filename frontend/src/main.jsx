import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './routes'

const root = document.getElementById('root')
createRoot(root).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>,
)
