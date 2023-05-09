import { Event } from '../schema/events.js'
import { EventDraft } from '../schema/types'

export class Provider {
  private readonly _secret : Uint8Array | undefined

  constructor (secret : string | Uint8Array) {
    this._secret = secret
  }

  async getPublicKey (tweak : string) : Promise<string> {
    return tweak
  }

  async signEvent (event : EventDraft, tweak : string) : Promise<Event> {
    return event
  }

  nip04 = {
    encrypt : async () : Promise<string> => { return '' },
    decrypt : async () : Promise<string> => { return '' }
  }

  deriveKey(tweak : string) {

  }

  getRelays() {

  }
}
