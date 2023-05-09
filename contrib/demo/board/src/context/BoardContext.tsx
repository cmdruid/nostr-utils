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

import { stubData } from 'test/stub'

const ENV = { mode: 'development' }

interface Props {
  children : ReactElement | ReactElement[]
}

interface Action {
  type     : string
  payload ?: any
}

interface BoardContext {
  board    : RefObject<Thread | undefined>
  store    : BoardStore
  dispatch : Dispatch<Action>
}

interface BoardStore {
  config : {}
  label  : string | undefined
  status : string
  posts  : SignedEvent[]
  view   : string
}

const initialStore = {
  config : {},
  label  : undefined,
  status : 'INIT',
  view   : 'board',
  posts  : []
}

const context = createContext<BoardContext | undefined>(undefined)

const reducer = (
  store  : BoardStore,
  action : Action
) : BoardStore => {
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
    case 'posts':
      return { ...store, posts: action.payload }
    case 'view':
      if (typeof action.payload === 'string') {
        return { ...store, view: action.payload }
      } else { return store }
    default:
      throw new Error('invalid action')
  }
}

export function BoardProvider (
  { children } : Props
) : ReactElement {
  const [ store, dispatch ] = useReducer(reducer, initialStore)

  const { client } = useClientContext()
  const board = useRef<Thread | undefined>(undefined)

  useEffect(() => {
    // Update the board and store cache
    // on a change of topic.
    console.log(store.label, board.current?.label, store.status)
    if (
      client.current !== null &&
      store.label    !== undefined &&
      store.label    !== board.current?.label &&
      store.status   !== 'LOADING'
    ) {
      console.log('board loading')
      board.current = new Thread(client.current, store.label, store.config)
      dispatch({ type: 'status', payload: 'LOADING' })

      if (ENV.mode !== 'development') {
        board.current.sub.within('eose', (sub) => {
          dispatch({ type: 'posts', payload: sub.cache })
          dispatch({ type: 'status', payload: 'OK' })
         }, 10000)
        void board.current.sub.update()
      } else {
        dispatch({ type: 'status', payload: 'OK' })
        dispatch({ type: 'posts', payload: stubData })
      }
    }
  }, [ board, store ])

  useEffect(() => {
    // Ensure parity between the board
    // cache and the store cache.
    if (
      board.current !== undefined &&
      ENV.mode !== 'development'
    ) {
      const cache = board.current.sub.cache
      if (store.posts.length !== cache.length) {
        dispatch({ type: 'posts', payload: cache })
      }
    }
  }, [ board, store ])

  return (
    <context.Provider value={{ board, store, dispatch }}>
        {children}
    </context.Provider>
  )
}

export function useBoardContext () : BoardContext {
  const storeContext = useContext(context)
  if (storeContext === undefined) {
    throw new Error('Store is undefined!')
  }
  return storeContext
}
