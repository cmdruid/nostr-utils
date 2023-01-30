import { NostrClient } from '../src/index'

const client = new NostrClient()

client.on('info', console.log)

await client.connect('wss://nostr.zebedee.cloud')

console.log(await client.queryOne({ kinds : [ 1 ] }))

client.close()
