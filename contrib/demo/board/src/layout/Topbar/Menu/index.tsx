import { ReactElement } from 'react'
import styles from './styles.module.css'
import { useDropdown }  from '@/hooks/useDropDown'
import { useStorage }   from '@/hooks/useStorage'
import { useNostrContext } from '@/context/NostrContext'

export default function DropMenu () : ReactElement {
  const [ privKey, setPrivKey ] = useStorage('prv', '', true)
  const [ ref, isOpen, open, close ] = useDropdown()

  const client = useNostrContext()

  function handleSubmit () : void {
    client.prvkey = privKey
  }

  return (
    <div className={styles.container} ref={ref}>
      <button
        className={styles.button}
        onMouseDown={() => { (isOpen) ? close() : open() }}
      > ☰ </button>
      { isOpen &&
        <div className={styles.dropdown}>
          <input
            className={styles.input}
            type="text" value={privKey}
            onChange={(e) => { setPrivKey(e.target.value) }}
            placeholder={'enter your private key ...'}
          />
          <button
            className={styles.button}
            onClick={() => handleSubmit }
          > Submit</button>
        </div>
      }
    </div>
  )
}
