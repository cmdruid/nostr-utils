import { ReactElement } from 'react'
import { Anchor, Container, Divider, Image, Text, Title } from '@mantine/core'
import { useBoardContext } from '@/context/BoardContext'

import styles      from './styles.module.css'
import { NewPost } from '@/components/PostForm'

export function Banner () : ReactElement {
  const { store } = useBoardContext()

  return (
    <Container className={styles.container}>
      <Image
        height={100}
        fit="contain"
        src="sample.avif"
      />
      <Title c="maroon">/{store.label}/</Title>
      <Divider />
      <Text c="maroon">[<Anchor>Post a Reply</Anchor>]</Text>
      <NewPost />
    </Container>
  )
}
