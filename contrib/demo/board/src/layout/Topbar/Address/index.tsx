import { useNostrContext } from '@/context/NostrContext'
import { useStorage }      from '@/hooks/useStorage'
import { ReactElement }    from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import styles              from './styles.module.css'

export default function AddressBar () : ReactElement {
  const [ address, setAddress ] = useStorage('address', '')

  const client = useNostrContext()

  function handleSubmit () : void {
    void client.connect(address)
  }

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="text" value={address}
        onChange={(e) => { setAddress(e.target.value) }}
        placeholder={'enter a topic@relay.address ...'}
      />
      <button
        className={styles.button}
        onClick={() => handleSubmit }
      >
        <AiOutlineSearch
          className={styles.icon}
          size={25}
        />
      </button>
    </div>
  )
}
