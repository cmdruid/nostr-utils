import { NostrClient } from '../src/index'

const client = new NostrClient()

const sub0 = client.subscribe({ kinds : [ 0 ], limit: 1 })
const sub1 = client.subscribe({ kinds : [ 1 ], limit: 1 })
const sub2 = client.subscribe({ kinds : [ 2 ], limit: 1 })
const sub3 = client.subscribe({ kinds : [ 3 ], limit: 1 })
const sub4 = client.subscribe({ kinds : [ 4 ], limit: 1 })

sub0.on('event', (event) => console.log('sub0:', event.id))
sub1.on('event', (event) => console.log('sub1:', event.id))
sub2.on('event', (event) => console.log('sub2:', event.id))
sub3.on('event', (event) => console.log('sub3:', event.id))
sub4.on('event', (event) => console.log('sub4:', event.id))

client.on('info', console.log)
/// client.on('debug', console.log)

await client.connect('wss://relay.nostrich.de')

// client.close()

client.publish({ content, tags: [ ]})
