import { ReactElement } from 'react'
import { useNostrContext } from '@/context/NostrContext'

export function Board () : ReactElement {
  const client = useNostrContext()
  const boardTopic = window.location

  const feed = client.query({
    kinds  : [ 4000 ],
    ['#b'] : [ boardTopic ]
  })

  return (
    <div className="container">
      <TopicForm></TopicForm>
      <div className='board-stack'>
        {feed}
        <Topic></Topic>
      </div>
    </div>
  )
}
