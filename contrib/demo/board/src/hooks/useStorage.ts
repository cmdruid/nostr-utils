import { useState } from 'react'

type SetValue<T> = (value : T | ((val : T) => T)) => void

type StoreHook<T> = readonly [
  storedValue : T,
  setValue    :SetValue<T>
]

export function useStorage<T> (
  key : string,
  initialValue : T,
  sessionStore = false
) : StoreHook<T> {
  const [ storedValue, setStoredValue ] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    const item = (sessionStore)
      ? window.sessionStorage.getItem(key)
      : window.localStorage.getItem(key)

    if (item === '') return undefined

    try {
      return (typeof item === 'string')
        ? JSON.parse(item)
        : item
    } catch { return item }
  })

  const setValue = (value : T | ((val : T) => T)) : void => {
    try {
      const valueToStore = (value instanceof Function)
        ? value(storedValue)
        : value

      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        const val = (valueToStore !== undefined)
          ? JSON.stringify(valueToStore)
          : ''
        if (sessionStore) {
          window.sessionStorage.setItem(key, val)
        } else { window.localStorage.setItem(key, val) }
      }
    } catch (error) { console.error(error) }
  }
  return [ storedValue, setValue ] as const
}
