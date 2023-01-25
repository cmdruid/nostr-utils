import { Hash } from './hash'
import { Base64, Hex, Text } from '../lib/format'

const crypto = globalThis.crypto

async function importKey (
  secretkey : string | Uint8Array
) : Promise<CryptoKey> {
  /** Derive a shared key-pair and import as a
   *  CryptoKey object (for Webcrypto library).
   */
  const cipher  : Uint8Array   = Hex.normalize(secretkey)
  const options : KeyAlgorithm = { name: 'AES-CBC' }
  const usage   : KeyUsage[]   = [ 'encrypt', 'decrypt' ]
  return crypto.subtle.importKey('raw', cipher, options, true, usage)
}

export class Cipher {
  private readonly secretkey : Uint8Array

  public static async from (secret : string) : Promise<Cipher> {
    const secretkey = await Hash.from(secret).raw
    return new Cipher(secretkey)
  }

  public static async encrypt (
    message   : string,
    secretkey : string | Uint8Array
  ) : Promise<string> {
    /** Encrypt a message using a secret cipher. */
    const payload = Text.encode(message)
    const vector  = crypto.getRandomValues(new Uint8Array(16))
    const cipher  = await importKey(secretkey)
    const buffer  = await crypto.subtle
      .encrypt({ name: 'AES-CBC', iv: vector }, cipher, payload)
      .then((bytes) => new Uint8Array(bytes))
    // Return a concatenated and base64 encoded array.
    return Base64.encode(new Uint8Array(buffer)) + '?iv=' + Base64.encode(vector)
  }

  public static async decrypt (
    message   : string,
    secretkey : string | Uint8Array
  ) : Promise<string> {
    /** Decrypt an encrypted message using a CryptoKey object. */
    if (!message.includes('?iv=')) throw TypeError('Invalid encryption string!')
    const [ payload, iv ] = message.split('?iv=')
    const buffer  = Base64.decode(payload)
    const vector  = Base64.decode(iv)
    const cipher  = await importKey(secretkey)
    const options = { name: 'AES-CBC', iv: vector }
    const decoded = await crypto.subtle.decrypt(options, cipher, buffer)
    return Text.decode(new Uint8Array(decoded))
  }

  constructor (secretkey : string | Uint8Array) {
    this.secretkey = Hex.normalize(secretkey)
  }

  public async encrypt (message : string) : Promise<string> {
    return Cipher.encrypt(message, this.secretkey)
  }

  public async decrypt (message : string) : Promise<string> {
    return Cipher.decrypt(message, this.secretkey)
  }
}
