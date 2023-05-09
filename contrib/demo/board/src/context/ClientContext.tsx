import { NostrClient } from '../../../../../src/index'

import {
  createContext,
  Dispatch,
  ReactElement,
  RefObject,
  useContext,
  useEffect,
  useReducer,
  useRef
} from 'react'

interface Props {
  children : ReactElement | ReactElement[]
}

interface Action {
  type     : string
  payload ?: any
}

interface ClientContext {
  client   : RefObject<NostrClient>
  store    : ClientStore
  dispatch : Dispatch<Action>
}

export interface ClientConfig {
  prvkey ?: string
}

interface ClientStore {
  config  : ClientConfig
  address : string | undefined
  status  : string
}

export const defaults : ClientStore = {
  config  : {},
  address : undefined,
  status  : 'INIT'
}

const ENV = { mode: 'development' }

const context = createContext<ClientContext | undefined>(undefined)

const reducer = (
  store  : ClientStore,
  action : Action
) : ClientStore => {
  switch (action.type) {
    case 'config':
      return { ...store, config: action.payload }
    case 'address':
      if (typeof action.payload === 'string') {
        return { ...store, address: action.payload }
      } else { return store }
    case 'status':
      if (typeof action.payload === 'string') {
        return { ...store, status: action.payload }
      } else { return store }
    default:
      throw new Error('invalid action')
  }
}

export function ClientProvider (
  { children } : Props
) : ReactElement {
  const [ store, dispatch ] = useReducer(reducer, defaults)

  const client = useRef(new NostrClient())

  client.current.on('info', console.log)

  useEffect(() => {
    console.log(store.address, client.current.address, store.status)
    if (
      store.address !== undefined &&
      store.address !== client.current.address &&
      store.status  !== 'CONNECTING'
    ) {
      console.log('fired connect')
      dispatch({ type: 'status', payload: 'CONNECTING' })

      if (ENV.mode !== 'development') {
        client.current.once('ready', () => {
          dispatch({ type: 'status', payload: 'CONNECTED' })
       })
        void client.current.connect(store.address)
      } else {
        client.current.address = store.address
        dispatch({ type: 'status', payload: 'CONNECTED' })
      }
    }
  }, [ client, store ])

  return (
    <context.Provider value={{ client, store, dispatch }}>
        {children}
    </context.Provider>
  )
}

export function useClientContext () : ClientContext {
  const clientContext = useContext(context)
  if (clientContext === undefined) {
    throw new Error('Nostr client is undefined!')
  }
  return clientContext
}
