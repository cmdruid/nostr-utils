import { ReactElement } from 'react'

import { Select, FileInput, Textarea, TextInput, Button } from '@mantine/core'

import styles from './styles.module.css'
import { useForm } from '@mantine/form'

interface Props {
  isRoot : boolean
}

export function NewPost (
  { isRoot } : Props
) : ReactElement {
  const form = useForm({})

  function handleSubmit (values : any) : void {
    console.log(values)
  }

  return (
    <div className={styles.container}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput className={styles.input}
          placeholder="Anonymous"
          name="name"
          label="Name"
        />
        <TextInput className={styles.input}
          name="options"
          label="Options"
        />
        {isRoot &&
          <TextInput className={styles.input}
            name='subject'
            label="Subject"
          />
        }
        <Textarea className={styles.input}
          name='comment'
          label="Comment"
          minRows={4}
        />
        <Select className={styles.input}
          label="Flag"
          placeholder="Flag"
          data={[
            { value: 'react', label: 'React' },
            { value: 'ng', label: 'Angular' },
            { value: 'svelte', label: 'Svelte' },
            { value: 'vue', label: 'Vue' }
          ]}
        />
        <FileInput className={styles.input}
          placeholder="Choose File"
          label="File"
        />
        <Button type="submit" className={styles.submitBtn}>Submit</Button>
      </form>
    </div>
  )
}

interface UploadResponse {
  ok    : boolean
  code  : number
  error : string
  data  : string | null
}

async function uploadFile(file : string) : UploadResponse {
  const endpoint = 'https://catbox.moe/user/api.php'
  const request = {
    method  : 'POST',
    headers : {
      'Content-Type': 'multipart/form-data'
    }
  }

  const { ok, status, statusText, text } = await fetch(endpoint, request)

  return {
    ok,
    code  : status,
    error : statusText,
    data  : ok ? await text() : null
  }
}
