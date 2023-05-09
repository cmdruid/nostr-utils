import { ReactElement } from 'react'
import { Image, Text }  from '@mantine/core'
import styles           from './styles.module.css'

interface Props {
  src : string
}

export function ImageBox (
  { src } : Props
) : ReactElement {
  return (
    <>
      {/* { file !== undefined && */
        <div className={styles.container}>
          <div className="image-title">
            <Text c="maroon" fz={10}>{`File: ${src} (2.7 MB, 854x480)`}</Text>
          </div>
          <Image className={styles.image}
            src={src}
          />
        </div>
      }
    </>
  )
}
