import { NostrClient, Topic } from '../src/index'

const client = new NostrClient()

client.on('info', console.log)
// client.on('debug', console.log)

const topic = new Topic(client, 'test')

await client.connect('wss://relay.nostrich.de')

// topic.sub.on('event', (event) => console.log(event.id))

topic.publish({ content: 'testing!' })

const events = await topic.sub.fetch()

console.log(events)
