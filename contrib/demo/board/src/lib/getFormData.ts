export function getFormData (
  formData : HTMLFormElement
) : Record<string, string> {
  const entries = [ ...new FormData(formData) ]
  const mapped  = entries.map(([ k, v ]) => {
    return [ k, String(v) ]
  })
  return Object.fromEntries(mapped)
}
