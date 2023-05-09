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

import { SignedEvent, Thread } from '../../../../../src'
import { useClientContext } from './ClientContext'

interface Props {
  children : ReactElement | ReactElement[]
}

interface Action {
  type     : string
  payload ?: any
}

interface ThreadContext {
  thread   : RefObject<Thread | undefined>
  store    : ThreadStore
  dispatch : Dispatch<Action>
}

interface ThreadStore {
  config  : {}
  label   : string | undefined
  status  : string
  replies : SignedEvent[]
}

const initialStore = {
  config  : {},
  label   : undefined,
  status  : 'INIT',
  replies : []
}

const context = createContext<ThreadContext | undefined>(undefined)

const reducer = (
  store  : ThreadStore,
  action : Action
) : ThreadStore => {
  switch (action.type) {
    case 'config':
      return { ...store, config: action.payload }
    case 'label':
      if (typeof action.payload === 'string') {
        return { ...store, label: action.payload }
      } else { return store }
    case 'status':
      if (typeof action.payload === 'string') {
        return { ...store, status: action.payload }
      } else { return store }
    case 'replies':
      return { ...store, replies: action.payload }
    default:
      throw new Error('invalid action')
  }
}

export function ThreadProvider (
  { children } : Props
) : ReactElement {
  const [ store, dispatch ] = useReducer(reducer, initialStore)

  const { client } = useClientContext()
  const thread  = useRef<Thread | undefined>(undefined)

  useEffect(() => {
    // Update the thread and store cache
    // on a change of topic.
    if (
      client.current !== null &&
      store.label    !== undefined &&
      store.label    !== thread.current?.label &&
      store.status   !== 'LOADING'
    ) {
      thread.current = new Thread(client.current, store.label, store.config)
      dispatch({ type: 'status', payload: 'LOADING' })

      thread.current.sub.once('eose', (sub) => {
        dispatch({ type: 'topics', payload: sub.cache })
        dispatch({ type: 'status', payload: 'OK' })
      })
    }
  }, [ thread, store ])

  useEffect(() => {
    // Ensure parity between the thread
    // cache and the store cache.
    if (thread.current !== undefined) {
      const cache = thread.current.sub.cache
      if (store.replies.length !== cache.length) {
        dispatch({ type: 'topics', payload: cache })
      }
    }
  }, [ thread, store ])

  return (
    <context.Provider value={{ thread, store, dispatch }}>
        {children}
    </context.Provider>
  )
}

export function useThreadContext () : ThreadContext {
  const storeContext = useContext(context)
  if (storeContext === undefined) {
    throw new Error('Store is undefined!')
  }
  return storeContext
}
