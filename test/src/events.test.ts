import { Test }  from 'tape'
import { sleep } from './utils.js'

import { NostrClient, EventChannel } from '../../src/index.js'

const client = new NostrClient({ selfsub: true })
const topic  = client.channel('testing', { secret : 'superisatestnet' })

await client.connect('wss://nostr.zebedee.cloud')

export function eventTests(t : Test) {
  t.test('onTest',     t => onTest(t, topic))
  t.test('onceTest',   t => onceTest(t, topic))
  t.test('withinTest', t => withinTest(t, topic))
  
  t.teardown(() => {
    console.log('\nclosing socket...')
    client.close()
  })
}

async function onTest(t : Test, topic : EventChannel) {
  let state = ''
  t.plan(1)
  topic.on('onTest', (data, _) => {
    state = data
  })
  topic.send('onTest', 'pass 1')
  await sleep(1000)
  t.equal(state, 'pass 1', 'should update the state.')
}

async function onceTest(t : Test, topic : EventChannel) {
  let state = ''

  t.plan(2)

  topic.once('onceTest', (data, _) => {
    state = data
  })

  topic.send('onceTest', 'pass 1')
  await sleep(1000)
  t.equal(state, 'pass 1', 'should update the state.')

  topic.send('onceTest', 'pass 2')
  await sleep(1000)
  t.notEqual(state, 'pass 2', 'should fail to update the state.')
}

async function withinTest(t : Test, topic : EventChannel) {
  let state = ''

  t.plan(3)

  topic.within('withinTest', (data, _) => {
    state = data
  }, 2000)

  topic.send('withinTest', 'pass 1')
  await sleep(1000)
  t.equal(state, 'pass 1', 'should update, is within the timeout')

  topic.send('withinTest', 'pass 2')
  await sleep(1000)
  t.equal(state, 'pass 2', 'should update, is within the timeout')

  topic.send('withinTest', 'pass 3')
  await sleep(1000)
  t.notEqual(state, 'pass 3', 'should fail to update, is outside the timeout')
}
