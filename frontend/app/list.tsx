'use client'

import React from 'react'
import { Reorder } from 'framer-motion'
import { io } from 'socket.io-client'

import { Name } from '@/types'

const mock: Name[] = ['MrILL', 'Lepeico', 'Anatoliy', 'Anton']

const URL = 'localhost:3001'
export const socket = io(URL, {
  autoConnect: false,
})

type RawListUnit = {
  id: number
  name: Name
}

const Item = ({
  rank,
  data,
  onDragEnd,
  onRename,
  onRenameSubmit,
  onDelete,
}: {
  rank: number
  data: RawListUnit
  onDragEnd: () => void
  onRename: (newName: string) => void
  onRenameSubmit: (name: string) => void
  onDelete: () => void
}) => {
  const { id, name } = data

  return (
    <Reorder.Item
      value={data}
      whileDrag={{
        cursor: 'grabbing',
      }}
      onDragEnd={() => onDragEnd()}
      className="rounded-xl bg-orange-50 shadow p-2 items-center cursor-grab mb-2 flex justify-between group"
    >
      <div className="flex gap-3 items-center">
        <div className="h-7 w-7 flex items-center justify-center text-sm font-bold bg-orange-500 text-white rounded-lg">
          {rank}
        </div>
        <input
          key={id}
          size={0}
          type="text"
          value={name}
          onChange={(e) => onRename(e.currentTarget.value)}
          onBlur={() => onRenameSubmit(name)}
          className="border-none bg-transparent p-0 m-0 outline-none font-inherit text-inherit truncate min-w-24 w-full"
        />
      </div>
      <button
        className="h-7 w-7 flex items-center justify-center rounded-lg transition opacity-0 group-hover:opacity-100 text-orange-800 hover:bg-orange-500/10"
        onClick={() => onDelete()}
      >
        &#10006;
      </button>
    </Reorder.Item>
  )
}

export const List = () => {
  const [list, setList] = React.useState<RawListUnit[]>([])
  const [newName, setNewName] = React.useState('')
  const [error, setError] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('connect')
      // socket.emit('ranked-names:get-all')
    })

    socket.on('ranked-names-updated', (data) => {
      // TODO types
      console.log(data)
      const names = data.map(({ id, name }: any) => ({
        id,
        name,
      }))
      console.log(names)
      setList(names)
    })

    socket.on('error', (errors) => {
      console.log('errors', errors)
    })

    socket.connect()
  }, [])

  const handleReorder = (newList: RawListUnit[]) => {
    console.log('reorder', newList)
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
  console.log(list)

  const handleChange = (name: string) => {
    setNewName(name)

    if (!nameIsUnique(name)) {
      setError(`Name is not unique: ${name}`)
    } else {
      setError(undefined)
    }
    // TODO call backend to save state
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
    // const updatedList = [...list]
    // updatedList.splice(index, 1)
    // setList(updatedList)

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
            // TODO rewrite in classnames
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
