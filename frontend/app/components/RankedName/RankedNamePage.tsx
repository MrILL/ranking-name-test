import React from 'react'
import { AnimatePresence, Reorder, motion } from 'framer-motion'
import { io } from 'socket.io-client'

import { Name, RawListUnit } from './types'
import { Item } from './RankedNameItem'
import { EmptyList } from './EmptyList'
import { WSWaiter } from './WSWaiter'
import { RankedNameList } from './RankedNameList'
import { AddRankedNameForm } from './AddRankedNameForm'

const mock: Name[] = ['MrILL', 'Lepeico', 'Anatoliy', 'Anton']

const URL = 'localhost:3001'
export const socket = io(URL, {
  autoConnect: false,
})

export const RankedNamePage = () => {
  const [list, setList] = React.useState<RawListUnit[]>([])
  const [isWsConnected, setWsConnected] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    socket.on('connect', () => {
      setWsConnected(true)
      console.log('ws: connect')
    })

    socket.on('disconnect', () => {
      setWsConnected(false)
      console.log('ws: disconnect')
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

  const handleAdd = (newName: string): boolean => {
    if (!nameIsUnique(newName)) {
      setError(`Name is not unique: ${newName}`)

      return false
    }

    socket.emit('ranked-names:add', {
      createDto: {
        name: newName,
        prev: list.at(-1)?.name,
      },
    })

    return true
  }

  const handleChange = (name: string) => {
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
    <div className="flex min-h-screen flex-col relative">
      <div
        className={`flex flex-col grow items-center justify-between p-24 ${
          isWsConnected ? '' : 'opacity-40'
        }`}
      >
        <AnimatePresence>
          {list.length ? (
            <RankedNameList
              list={list}
              setList={handleReorder}
              onDragEnd={handleOnDragEnd}
              onRename={handleRename}
              onRenameSubmit={handleRenameSubmit}
              onRemove={handleDelete}
            />
          ) : (
            <EmptyList />
          )}
        </AnimatePresence>
        <AddRankedNameForm
          onSubmit={handleAdd}
          onChange={handleChange}
          error={error}
        />
      </div>
      <AnimatePresence>
        {!isWsConnected && (
          <motion.div
            className="absolute flex flex-col gap-8 grow top-0 bottom-0 left-0 right-0 items-center justify-center transition backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <WSWaiter />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
