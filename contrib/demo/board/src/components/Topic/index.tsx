import { ReactElement } from 'react'

/* Board has topics, topics have posts. */

interface Props {
  topicEvent : string
}

export function TopicPost (
  { topicEvent } : Props
) : ReactElement {
  return (
    <div className="post-container">
      lores ipsum
    </div>
  )
}
