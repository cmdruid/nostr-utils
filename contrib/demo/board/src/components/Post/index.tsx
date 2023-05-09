import { ReactElement } from 'react'
import { Event } from '../../../../../../src/schema/types'

import { Paper, Text } from '@mantine/core'

import { PostBar } from './PostBar'

import styles from './styles.module.css'
import { ImageBox } from './ImageBox'

interface Props {
  event  : Event
  isRoot : boolean
  // refs  : string[]
}

export function Post (
  { event, isRoot } : Props
) : ReactElement {
  let file

  event.tags.forEach(([ key, value ]) => {
    if (key === 'file' && typeof value === 'string') {
      file = value
    }
  })

  const classNames = [ styles.post ]

  if (!isRoot) classNames.push(styles.comment)

  return (
    <Paper className={classNames.join(' ')} p="xs" radius={0}>
      {file !== undefined && isRoot && <ImageBox src={file} /> }
      <PostBar event={event} />
      <div className={styles.imageWrap}>
        {file !== undefined && !isRoot && <ImageBox src={file} />}
      </div>
      <div className="content-wrap">
        <div className={styles.content}>
          <Text c="maroon" fz={12}>{event.content}</Text>
        </div>
      </div>
    </Paper>
  )
}
