import { AnimatePresence, Reorder } from 'framer-motion'
import { RawListUnit } from './types'
import { Item } from './RankedNameItem'

export type RankedNameListProps = {
  list: RawListUnit[]
  setList: (newList: RawListUnit[]) => void
  onDragEnd: (id: number, name: string) => void
  onRename: (id: number, name: string) => void
  onRenameSubmit: (id: number, name: string) => void
  onRemove: (id: number) => void
}

export function RankedNameList({
  list,
  setList,
  onDragEnd,
  onRename,
  onRenameSubmit,
  onRemove,
}: RankedNameListProps) {
  return (
    <Reorder.Group
      key="non-empty-list"
      axis="y"
      values={list}
      onReorder={setList}
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
              onDragEnd={() => onDragEnd(id, name)}
              onRename={(newName) => onRename(id, newName)}
              onRenameSubmit={(name) => onRenameSubmit(id, name)}
              onDelete={() => onRemove(id)}
            />
          )
        })}
      </AnimatePresence>
    </Reorder.Group>
  )
}
