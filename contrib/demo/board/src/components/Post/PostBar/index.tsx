import { ReactElement } from 'react'
import { Buff }  from '@cmdcode/buff-utils'
import { Event } from '@/../../src'

import { Avatar, Group, Text } from '@mantine/core'

import styles from './styles.module.css'

interface Props {
  event : Event
  // refs  : string[]
}

export function PostBar (
  { event } : Props
) : ReactElement {
  let name = 'Anonymous'
  let flag = 'bitcoin'

  event.tags.forEach(([ key, value ]) => {
    if (key === 'name' && typeof value === 'string') {
      name = value
    }
  })

  event.tags.forEach(([ key, value ]) => {
    if (key === 'flag' && typeof value === 'string') {
      flag = value
    }
  })

  const date = new Date(event.created_at * 1000).toLocaleString()
  const postId = (Buff.hex(event.id).toBig() % BigInt(event.created_at)).toString()

  return (
    <Group className={styles.container} spacing={2}>
      { event.subject !== undefined &&
        <Text c="maroon" fw={700} fz={12}>{event.subject}</Text>
      }
      <Text c="#117743" fw={700} fz={12}>{name}</Text>
      <PubId pubkey={event.pubkey} />
      <Avatar size={11} src={`flags/${flag}.webp`} alt={flag} />
      <span>{date}</span>
      <span className="event-link">No:</span>
      <span className="event-code">{postId}</span>
      <span className="post-menu"></span>
      <span className="ref-links"></span>
    </Group>
  )
}

function PubId (
  { pubkey } : { pubkey : string }
) : ReactElement {
  const from  = '#' + pubkey.slice(0, 6)
  const pubId = btoa(pubkey.slice(0, 6))
  return <span
    className={styles.pubId}
    style={{ backgroundColor: from }}
    >
      {pubId}
    </span>
}
