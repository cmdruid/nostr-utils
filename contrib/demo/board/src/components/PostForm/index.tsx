import { ReactElement } from 'react'
import { useNostrContext } from '@/context/NostrContext'

/* Board has topics, topics have posts. */

interface Props {
  topic : string
}

export function TopicForm (
  { topic } : Props
) : ReactElement {
  const client = useNostrContext()

  function submit (e : Event) : void {
    e.preventDefault()
    // Create template from form.
    client.publish()
  }

  // Build form for creating template.
  return (
    <div className="container">
      <form>

      </form>
    </div>
  )
}
