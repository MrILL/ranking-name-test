'use client'

import React from 'react'
import { Reorder } from 'framer-motion'

import { Name } from '@/types'

const mock: Name[] = ['MrILL', 'Lepeico', 'Anatoliy', 'Anton']

export const Item = ({ item }: { item: any }) => {
  return (
    <Reorder.Item value={item} id={item}>
      <span>{item}</span>
    </Reorder.Item>
  )
}

export const List = () => {
  const [list, setList] = React.useState(mock)
  const [newName, setNewName] = React.useState('')
  const [error, setError] = React.useState<string | undefined>(undefined)

  const handleReorder = (newList: Name[]) => {
    setList(newList)
    // TODO call backend to save state
  }

  const nameIsUnique = (name: string): boolean => {
    const index = list.findIndex((rankedName) => rankedName === name)

    return index === -1
  }

  const handleAdd = (newName: string) => {
    if (!nameIsUnique(newName)) {
      setError(`Name is not unique: ${newName}`)

      return
    }

    setList([...list, newName])
    setNewName('')
    // TODO call backend to save state
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

  const handleDelete = (name: Name, index: number) => {
    const updatedList = [...list]
    updatedList.splice(index, 1)
    setList(updatedList)
    // TODO call backend to save state
  }

  return (
    <>
      <Reorder.Group
        axis="y"
        values={list}
        onReorder={handleReorder}
        className="relative w-80"
      >
        {list.map((rankedName, i) => {
          return (
            <Reorder.Item
              key={rankedName}
              value={rankedName}
              whileDrag={{
                cursor: 'grabbing',
              }}
              className="rounded-xl bg-orange-50 shadow p-2 items-center cursor-grab mb-2 flex justify-between group"
            >
              <div className="flex gap-3 items-center">
                <div className="h-7 w-7 flex items-center justify-center text-sm font-bold bg-orange-500 text-white rounded-lg">
                  {i + 1}
                </div>
                {/* TODO contentEditable request on back */}
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="text-orange-950"
                >
                  {rankedName}
                </div>
              </div>
              <button
                className="h-7 w-7 flex items-center justify-center rounded-lg transition opacity-0 group-hover:opacity-100 text-orange-800 hover:bg-orange-500/10"
                onClick={() => handleDelete(rankedName, i)}
              >
                &#10006;
              </button>
            </Reorder.Item>
          )
        })}
      </Reorder.Group>
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
