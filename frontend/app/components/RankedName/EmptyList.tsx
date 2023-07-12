import { motion } from 'framer-motion'

export function EmptyList() {
  return (
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
  )
}
