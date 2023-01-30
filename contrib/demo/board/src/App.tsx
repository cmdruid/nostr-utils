import { ReactElement } from 'react'
import { useNostrContext } from '@/context/NostrContext'
import './styles/layout.css'

export default function App () : ReactElement {
  const client = useNostrContext()

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Board Demo</h1>
      <form>
        <div>
          <label>Subject</label>
          <input />
        </div>
        <div>
          <label>Body</label>
          <input />
        </div>
        <div>
          <label>Image</label>
          <input />
        </div>
        <div>
          <button onClick={() => { console.log(client) }}>
            Log client to console
          </button>
        </div>
      </form>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}
