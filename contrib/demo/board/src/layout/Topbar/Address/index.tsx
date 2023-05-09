import { useClientContext } from '@/context/ClientContext'
import { useBoardContext } from '@/context/BoardContext'
import { useStorage }      from '@/hooks/useStorage'
import { ReactElement, useEffect }    from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import styles              from './styles.module.css'

export default function AddressBar () : ReactElement {
  const [ address, setAddress ] = useStorage('address', '')

  const {
    store    : clientStore,
    dispatch : clientDispatch
  } = useClientContext()
  const { dispatch: boardDispatch }  = useBoardContext()

  function handleSubmit () : void {
    const [ topic, relay ] = address.split('@')
    clientDispatch({ type: 'address', payload: relay })
    boardDispatch({ type: 'label', payload: topic })
  }

  useEffect(() => {
    if (
      address !== undefined &&
      clientStore.status === 'INIT'
    ) { handleSubmit() }
  }, [ address, clientStore ])

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
        onClick={handleSubmit}
      >
        <AiOutlineSearch
          className={styles.icon}
          size={25}
        />
      </button>
    </div>
  )
}
