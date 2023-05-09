import { NostrClient, Query } from '../src/index'

const client = new NostrClient()

client.on('info', console.log)
// client.on('debug', console.log)

const query = new Query(client, { kinds : [ 1 ], limit: 10 })

await client.connect('wss://relay.nostrich.de')

console.log(await query.sub.fetch().then(e => e.length))
