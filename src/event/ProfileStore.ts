import { NostrClient }        from '../class/client'
import { Store, StoreConfig } from '../view/store'

export class ProfileStore {
  public readonly store : Store

  constructor (
    client : NostrClient,
    pubkey : string = client.pubkey,
    config : StoreConfig = {}
  ) {
    const { filter, template } = config

    this.store = new Store(client, {
      filter   : { kinds: [ 0 ], authors: [ pubkey ], ...filter },
      template : { kind: 0, ...template }
    })
  }

  get name () : string | undefined {
    return this.store.get('name') as string
  }

  set name (name : string | undefined) {
    void this.store.set('name', name ?? null)
  }

  get display_name () : string | undefined {
    return this.store.get('display_name') as string
  }

  set display_name (name : string | undefined) {
    void this.store.set('display_name', name ?? null)
  }

  get about () : string | undefined {
    return this.store.get('about') as string
  }

  set about (about : string | undefined) {
    void this.store.set('about', about ?? null)
  }

  get website () : string | undefined {
    return this.store.get('website') as string
  }

  set website (url : string | undefined) {
    void this.store.set('website', url ?? null)
  }

  get picture () : string | undefined {
    return this.store.get('picture') as string
  }

  set picture (url : string | undefined) {
    void this.store.set('picture', url ?? null)
  }

  get banner () : string | undefined {
    return this.store.get('banner') as string
  }

  set banner (url : string | undefined) {
    void this.store.set('banner', url ?? null)
  }

  get nip05 () : string | undefined {
    return this.store.get('nip05') as string
  }

  set nip05 (address : string | undefined) {
    void this.store.set('nip05', address ?? null)
  }

  get lud16 () : string | undefined {
    return this.store.get('nip05') as string
  }

  set lud16 (address : string | undefined) {
    void this.store.set('nip05', address ?? null)
  }
}
