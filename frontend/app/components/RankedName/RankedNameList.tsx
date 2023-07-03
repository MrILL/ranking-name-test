import React from 'react'
import { AnimatePresence, Reorder, motion } from 'framer-motion'
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
    <div className="flex min-h-screen flex-col relative">
      <div
        className={`flex flex-col grow items-center justify-between p-24 ${
          !isWsConnected ? 'opacity-40' : ''
        }`}
      >
        <AnimatePresence>
          {!list.length ? (
            <>
              <div />
              <motion.h1
                key="empty-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-center text-2xl"
              >
                Empty list! Add more names!
              </motion.h1>
            </>
          ) : (
            <Reorder.Group
              key="non-empty-list"
              axis="y"
              values={list}
              onReorder={handleReorder}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <AnimatePresence>
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
              </AnimatePresence>
            </Reorder.Group>
          )}
        </AnimatePresence>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAdd(newName)
          }}
          className="flex flex-col gap-1"
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
            <motion.div
              className="w-32 h-32 bg-blue-300"
              animate={{
                scale: [0.6, 0.6, 1, 1, 0.6],
                rotate: [0, 270, 90, 270, 0],
                borderRadius: ['20%', '20%', '50%', '20%', '20%'],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatDelay: 0.2,
              }}
            />
            <span className="text-center font-semibold py-4 text-2xl text-orange-1000/80 bg-orange-300/5">
              Waiting for Websocket connection
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
