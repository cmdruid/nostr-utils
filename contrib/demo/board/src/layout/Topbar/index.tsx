
import { ReactElement } from 'react'
import { useRouter }    from '@/hooks/useRouter'

import AddressBar from './Address'
import DropMenu   from './Menu'
import styles     from './styles.module.css'

export default function Topbar () : ReactElement {
  const router = useRouter()

  return (
    <div className={styles.topbar}>
      <div className={styles.start}>
        <img
          src="/pepe-ostrich.webp"
          alt="Vite logo"
          className={styles.logo}
          onClick={() => { router.push('/') }}
        />
      </div>
      <div className={styles.mid}>
        <AddressBar />
      </div>
      <div className={styles.end}>
        <DropMenu />
      </div>
    </div>
  )
}
