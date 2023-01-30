/** components/layout.js
 *  This file serves as the default boilerplate for each page.
 *  HTML for other pages will be wrapped within this layout component.
 */

// import { Head } from 'react'

import { ReactElement } from 'react'

import { Head } from '@/components/Head'
import TopBar from './Topbar'
import styles   from './styles.module.css'

interface Props {
  children : ReactElement | ReactElement[]
}

export const siteTitle = 'NostrChan'

export function Layout (
  { children } : Props
) : ReactElement {
  return (
    <div className={styles.container}>

      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>{siteTitle}</title>
        <meta
          name="description"
          content="Image board built on nostr."
        />
      </Head>

      <header className={styles.header}>
        <TopBar />
      </header>

      <main className={styles.main}>
        { children }
      </main>

      <footer className={styles.footer}>
         <p>Placeholder footer</p>
      </footer>

    </div>
  )
}
