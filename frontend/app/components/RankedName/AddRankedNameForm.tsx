import React from 'react'

export type AddRankedNameFormProps = {
  onSubmit: (newName: string) => boolean
  onChange: (name: string) => void
  error?: string
}

export function AddRankedNameForm({
  onSubmit,
  onChange,
  error,
}: AddRankedNameFormProps) {
  const [newName, setNewName] = React.useState('')

  const handleSubmit = (newName: string) => {
    if (onSubmit(newName)) {
      setNewName('')
    }
  }

  const handleChange = (name: string) => {
    setNewName(name)

    onChange(name)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(newName)
      }}
      className="flex flex-col gap-1"
    >
      <input
        placeholder="Name"
        className={`rounded-xl w-80 bg-orange-50 px-4 py-2 cursor-grab placeholder:text-orange-800/50 !outline-none transition hover:shadow-md shadow border ${
          error ? 'border-red-500 text-red-500 bg-red-50' : 'border-transparent'
        }`}
        onChange={(e) => handleChange(e.currentTarget.value)}
        value={newName}
      />
      <b className="text-xs text-red-500">{error}</b>
    </form>
  )
}
