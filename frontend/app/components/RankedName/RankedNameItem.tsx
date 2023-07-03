import { Reorder } from 'framer-motion'
import { RawListUnit } from './types'

export const Item = ({
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
      initial={{
        opacity: 0,
        y: 50,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
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
