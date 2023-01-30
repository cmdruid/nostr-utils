import { ReactElement } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  children : ReactElement | ReactElement[]
}

export function Head (
  { children } : Props
) : ReactElement {
  return createPortal(<>{children}</>, document.head)
}
