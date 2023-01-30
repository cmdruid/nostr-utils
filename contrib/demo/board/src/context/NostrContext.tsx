import { NostrClient } from '../../../../../src/index'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactElement
} from 'react'

interface Props {
  children : ReactElement | ReactElement[]
}

const NostrContext = createContext<NostrClient | undefined>(undefined)

export function NostrWrapper (
  { children } : Props
) : ReactElement {
  const [ config, setConfig ] = useState({})

  const client = new NostrClient()

  useEffect(() => {
    if (config === undefined) setConfig({})
  }, [ client ])

  const contextValue = useMemo(() => {
    return client
  }, [ client ])

  return (
    <NostrContext.Provider value={contextValue}>
        {children}
    </NostrContext.Provider>
  )
}

export function useNostrContext () : NostrClient {
  const context = useContext(NostrContext)
  if (context === undefined) {
    throw new Error('Nostr client is undefined!')
  }
  return context
}

// async function checkUserAccess(slug, callback) {
//   if (!slug) return false;

//   try {
//     const res  = await fetch(`/api/auth/check?slug=${slug}`)
//     return callback((res.status === 200))
//   } catch { return callback(false) }
// }
