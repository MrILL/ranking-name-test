import React from 'react'
import { Reorder } from 'framer-motion'
import { io } from 'socket.io-client'

import { Name, RawListUnit } from './types'
import { Item } from './RankedNameItem'

const mock: Name[] = ['MrILL', 'Lepeico', 'Anatoliy', 'Anton']

const URL = 'localhost:3001'
export const socket = io(URL, {
  autoConnect: false,
})

export const RankedNameList = () => {
  const [list, setList] = React.useState<RawListUnit[]>([])
  const [newName, setNewName] = React.useState('')
  const [error, setError] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('ws: connect')
    })

    socket.on('ranked-names-updated', (data: RawListUnit[]) => {
      console.log('ws: ranked-names-updated', data)

      const names = data.map(({ id, name }) => ({
        id,
        name,
      }))

      setList(names)
    })

    socket.on('error', (errors) => {
      console.log('ws: error', errors)
    })

    socket.connect()
  }, [])

  const handleReorder = (newList: RawListUnit[]) => {
    setList(newList)
  }

  const handleOnDragEnd = (id: number, name: string) => {
    const index = list.findIndex((rankedName) => rankedName.id === id)
    socket.emit('ranked-names:update', {
      id,
      updateDto: {
        name,
        prev: list[index - 1]?.name,
        next: list[index + 1]?.name,
      },
    })
  }

  const nameIsUnique = (name: string): boolean => {
    const index = list.findIndex((rankedName) => rankedName.name === name)

    return index === -1
  }

  const handleAdd = (newName: string) => {
    if (!nameIsUnique(newName)) {
      setError(`Name is not unique: ${newName}`)

      return
    }

    setNewName('')

    socket.emit('ranked-names:add', {
      createDto: {
        name: newName,
        prev: list.at(-1)?.name,
      },
    })
  }

  const handleChange = (name: string) => {
    setNewName(name)

    if (!nameIsUnique(name)) {
      setError(`Name is not unique: ${name}`)
    } else {
      setError(undefined)
    }
  }

  const handleRename = (id: number, name: string) => {
    const index = list.findIndex((rankedName) => rankedName.id === id)

    const newList = [...list]
    newList[index].name = name
    setList(newList)
  }

  const handleRenameSubmit = (id: number, name: string) => {
    socket.emit('ranked-names:rename', {
      id,
      newName: name,
    })
  }

  const handleDelete = (id: number) => {
    socket.emit('ranked-names:remove', {
      id,
    })
  }

  return (
    <>
      {!list.length ? (
        <>
          <div />
          <h1 className="font-bold text-center text-2xl">
            Empty list! Add more names!
          </h1>
        </>
      ) : (
        <Reorder.Group
          axis="y"
          values={list}
          onReorder={handleReorder}
          className="relative"
        >
          {list.map((rankedName, i) => {
            const { id, name } = rankedName

            return (
              <Item
                key={id}
                rank={i + 1}
                data={rankedName}
                onDragEnd={() => handleOnDragEnd(id, name)}
                onRename={(newName) => handleRename(id, newName)}
                onRenameSubmit={(name) => handleRenameSubmit(id, name)}
                onDelete={() => handleDelete(id)}
              />
            )
          })}
        </Reorder.Group>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAdd(newName)
        }}
        className="flex flex-col gap-1 h-32"
      >
        <input
          placeholder="Name"
          className={`rounded-xl w-80 bg-orange-50 px-4 py-2 cursor-grab placeholder:text-orange-800/50 !outline-none transition hover:shadow-md shadow border ${
            error
              ? 'border-red-500 text-red-500 bg-red-50'
              : 'border-transparent'
          }`}
          onChange={(e) => handleChange(e.currentTarget.value)}
          value={newName}
        />
        <b className="text-xs text-red-500">{error}</b>
      </form>
    </>
  )
}
