import React    from 'react'
import ReactDOM from 'react-dom/client'
import { NostrWrapper } from './context/NostrContext'
import { Layout } from '@/layout'
import App      from './App'
import './styles/normalize.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <NostrWrapper>
      <Layout>
        <App />
      </Layout>
    </NostrWrapper>
  </React.StrictMode>
)
