import { useMemo } from 'react'

interface Router extends URL {
  params : Record<string, string>
  jump   : (hash : string) => void
  push   : (url  : string) => void
  reload : () => void
}

export function useRouter () : Router {
  const url    = new URL(window.location.href)
  const params = Object.fromEntries(url.searchParams.entries())
  const reload = window.location.reload

  return useMemo(() => {
    return { jump, params, push, reload, ...url }
  }, [ jump, params, push, reload, url ])
}

function push (url : string) : void {
  const { href, origin, protocol } = window.location
  if (url.startsWith('/')) {
    url = origin + url
  }
  if (!url.includes(protocol)) {
    url = href + url
  }
  window.location.assign(url)
}

function jump (hash : string) : void {
  let { href } = window.location
  if (href.includes('#')) {
    href = href.split('#')[0]
  }
  window.location.replace(href + '#' + hash)
}
