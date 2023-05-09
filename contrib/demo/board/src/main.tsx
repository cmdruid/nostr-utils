import React    from 'react'
import ReactDOM from 'react-dom/client'

import { ClientProvider } from './context/ClientContext'
import { BoardProvider }  from './context/BoardContext'
import { ThreadProvider } from './context/ThreadContext'

import { Layout } from '@/layout'
import App        from './App'

import './styles/normalize.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClientProvider>
      <BoardProvider>
        <ThreadProvider>
          <Layout>
            <App />
          </Layout>
        </ThreadProvider>
      </BoardProvider>
    </ClientProvider>
  </React.StrictMode>
)
