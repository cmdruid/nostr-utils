import { ReactElement }     from 'react'
import { useDropdown }      from '@/hooks/useDropDown'

import styles from './styles.module.css'
import ClientForm from './ClientConfig'

export default function DropMenu () : ReactElement {
  const [ ref, isOpen, open, close ] = useDropdown()

  return (
    <div className={styles.container} ref={ref}>
      <button
        className={styles.menuButton}
        onMouseDown={() => { (isOpen) ? close() : open() }}
      > ☰ </button>
      { isOpen &&
        <div className={styles.dropdown}>
          <ClientForm />
        </div>
      }
    </div>
  )
}
