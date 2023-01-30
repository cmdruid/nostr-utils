import {
  useState,
  useCallback,
  useRef,
  useEffect,
  RefObject
} from 'react'

type DropdownHook = [
  ref    : RefObject<HTMLDivElement>,
  isOpen : boolean,
  open   : () => void,
  close  : () => void
]

const ESC_KEYS = [ 'Escape' ]

function onEscapeKeyPress (fn : () => void) {
  return ({ key } : KeyboardEvent) => {
    if (ESC_KEYS.includes(key)) fn()
  }
}

export function useDropdown () : DropdownHook {
  const [ isOpen, setIsOpen ] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const open   = useCallback(() => { setIsOpen(true) }, [])
  const close  = useCallback(() => { setIsOpen(false) }, [])

  useEffect(() => {
    const handleGlobalMouseDown = ({ target } : MouseEvent) : void => {
      if (
        target instanceof Node &&
        ref.current !== null &&
        ref.current.contains(target)
      ) {
        return
      }
      close()
    }

    const handleGlobalKeydown = onEscapeKeyPress(close)

    document.addEventListener('mousedown', handleGlobalMouseDown)
    document.addEventListener('keydown', handleGlobalKeydown)

    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown)
      document.removeEventListener('keydown', handleGlobalKeydown)
    }
  }, [ isOpen, close ])

  return [ ref, isOpen, open, close ]
}
