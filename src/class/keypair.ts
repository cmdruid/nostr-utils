import {
  getPublicKey,
  getSharedSecret,
  schnorr
} from '@noble/secp256k1'

import { Hash }    from './hash'
import { Hex, Text }     from '../lib/format'

async function sign (
  message    : string | Uint8Array,
  privateKey : string | Uint8Array
) : Promise<string> {
  const msg = Hex.normalize(message)
  const key = Hex.normalize(privateKey)
  return schnorr.sign(msg, key).then(raw => Hex.encode(raw))
}

async function verify (
  signature : string | Uint8Array,
  message   : string | Uint8Array,
  publicKey : string | Uint8Array
) : Promise<boolean> {
  const sig = Hex.normalize(signature)
  const msg = Hex.normalize(message)
  const key = Hex.normalize(publicKey)
  return schnorr.verify(sig, msg, key)
}

function getSharedKey (
  privKey : string | Uint8Array,
  recvPub : string | Uint8Array
) : Uint8Array {
  return getSharedSecret(
    Hex.normalize(privKey),
    Hex.normalize(recvPub)
  )
}

export class KeyPair {
  private readonly _privateKey : Uint8Array

  static random () : KeyPair {
    return new KeyPair(Hex.random(32))
  }

  static async fromSecret (
    string : string
  ) : Promise<KeyPair> {
    const seed = await Hash.from(string).raw
    return new KeyPair(seed)
  }

  static sign   = sign

  static verify = verify

  static getPub = (
    prvkey : string | Uint8Array
  ) : string => {
    return Hex.encode(getPublicKey(prvkey, true))
  }

  constructor (bytes : string | Uint8Array) {
    this._privateKey = Hex.normalize(bytes)
  }

  get prvkey () : string {
    return Hex.encode(this._privateKey)
  }

  get pubraw () : Uint8Array {
    return schnorr.getPublicKey(this._privateKey)
  }

  get pubkey () : string {
    return Hex.encode(this.pubraw)
  }

  async sign (message : string) : Promise<string> {
    return sign(message, this._privateKey)
  }

  async verify (
    message   : string,
    signature : string | Uint8Array
  ) : Promise<boolean> {
    return verify(signature, message, this.pubraw)
  }

  async derive (key : string) : Promise<KeyPair> {
    const buffer = Uint8Array.of(...this._privateKey, ...Text.encode(key))
    const newkey = await new Hash(buffer).raw
    return new KeyPair(newkey)
  }

  public getSharedKey (pubkey : string | Uint8Array) : Uint8Array {
    return getSharedKey(this._privateKey, pubkey)
  }
}
