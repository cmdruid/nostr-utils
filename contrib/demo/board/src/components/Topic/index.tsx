import { ReactElement } from 'react'

/* Board has topics, topics have posts. */

interface Props {
  topicEvent : string
}

export function TopicPost (
  { topicEvent } : Props
) : ReactElement {
  return (
    <div className="container">
      <div className="image-wrap">
        <div className="image-title">
          <span className="post-toggle"></span>
          <span className="image-name"></span>
          <span className="image-meta"></span>
        </div>
      </div>
      <div className="content-wrap">
        <div className="title-bar">
          <span className="trip-code"></span>
          <span className="pub-badge"></span>
          <span className="meme-flag"></span>
          <span className="date-stamp"></span>
          <span className="event-code"></span>
          <span className="post-menu"></span>
          <span className="ref-links"></span>
        </div>
        <div clasName="content-body">
          <div className="reply-link"></div>
          <div className="post-content"></div>
        </div>
      </div>
    </div>
  )
}
