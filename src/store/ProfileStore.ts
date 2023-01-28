import { NostrClient } from '../class/client'
import { Profile }     from '../schema/types'
import { Store }       from '../sub/store'

export class ProfileStore extends Store {
  constructor (
    client  : NostrClient,
    profile : Profile = {}
  ) {
    super(client, {
      content  : profile,
      filter   : { timeout: 10000, kind: 0, authors: [ client.pubkey ] },
      template : { kind: 0 }
    })
  }

  get name () : string | undefined {
    return this.get('name') as string
  }

  set name (name : string | undefined) {
    void this.set('name', name ?? null)
  }

  get about () : string | undefined {
    return this.get('about') as string
  }

  set about (about : string | undefined) {
    void this.set('about', about ?? null)
  }

  get picture () : string | undefined {
    return this.get('picture') as string
  }

  set picture (url : string | undefined) {
    void this.set('picture', url ?? null)
  }

  get nip05 () : string | undefined {
    return this.get('nip05') as string
  }

  set nip05 (url : string | undefined) {
    void this.set('nip05', url ?? null)
  }
}
