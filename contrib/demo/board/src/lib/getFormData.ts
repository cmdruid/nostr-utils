import { FormEvent } from 'react'

export function getFormData (
  e : FormEvent
) : Record<string, string> {
  e.preventDefault()
  if (e.target instanceof HTMLFormElement) {
    const entries = [ ...new FormData(e.target) ]
    const mapped  = entries.map(([ k, v ]) => {
      return [ k, String(v) ]
    })
    return Object.fromEntries(mapped)
  }
  throw new TypeError('Invalid form data!')
}
