import { useBoardContext } from '@/context/BoardContext'
import { ReactElement } from 'react'
import { Post } from '../Post'

import { Container, SimpleGrid } from '@mantine/core'

import { Banner } from './Banner'

import styles from './styles.module.css'
export function BoardView () : ReactElement {
  const { store } = useBoardContext()

  const root = 'cc8973c65d229cb782053674f4412dbe6a3862a53b21a8f35de6c24d408d0253'

  return (
    <Container className={styles.container}>
      <Banner />
      <SimpleGrid cols={1} spacing="xs" verticalSpacing={4}>
        {
          store.posts.map(event => {
            const isRoot = event.id === root
            return <Post key={event.id} event={event} isRoot={isRoot}/>
          })
        }
      </SimpleGrid>
      <button onClick={() => { console.log(store) }}>Log store</button>
    </Container>
  )
}
