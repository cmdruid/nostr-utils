import { ReactElement } from 'react'
import { useForm }      from '@mantine/form'
import { useStorage }   from '@/hooks/useStorage'

import { TextInput, Checkbox, Button, Group, Box } from '@mantine/core'

import {
  defaults,
  ClientConfig,
  useClientContext
} from '@/context/ClientContext'

// import styles from './styles.module.css'

export default function ClientForm () : ReactElement {
  const [ config, setConfig ] = useStorage('client_config', defaults.config, true)
  const { dispatch: clientDispatch } = useClientContext()

  function handleSubmit (values : ClientConfig) : void {
    setConfig(values)
    clientDispatch({ type: 'config', payload: config })
  }

  const form = useForm({
    initialValues: config
    // validate      : {
    //   email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    // }
  })

  return (
    <Box sx={{ maxWidth: 300 }} mx="auto">
      <form onSubmit={form.onSubmit((values) => { handleSubmit(values) })}>
        <TextInput
          withAsterisk
          label="Private Key"
          placeholder="enter your private key"
          {...form.getInputProps('prvkey')}
        />

        <Checkbox
          mt="md"
          label="I agree to sell my privacy"
          {...form.getInputProps('termsOfService', { type: 'checkbox' })}
        />

        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  )
}
