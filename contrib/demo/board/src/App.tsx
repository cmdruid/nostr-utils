import { ReactElement } from 'react'
import { BoardView }       from '@/components/Board/index'

import './styles/layout.css'

export default function App () : ReactElement {
  return (
    <div className="App">
      <BoardView />
    </div>
  )
}
