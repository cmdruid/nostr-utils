import { NostrClient, Page } from '../src/index'

const client = new NostrClient()

client.on('info', console.log)
// client.on('debug', console.log)

const page1 = new Page(client, { kinds : [ 1 ], limit: 10 })

await client.connect('wss://relay.nostrich.de')

const events1 = await page1.fetch()

console.log(events1.map(e => e.created_at))

const page2 = await page1.nextPage(10)

const events2 = await page2.fetch()

console.log(events2.map(e => e.created_at))

const page3 = await page2.nextPage(10)

const events3 = await page3.fetch()

console.log(events3.map(e => e.created_at))

const page4 = await page3.prevPage(10)

const events4 = await page4.fetch()

console.log(events4.map(e => e.created_at))
