import { motion } from 'framer-motion'

export function WSWaiter() {
  return (
    <>
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
    </>
  )
}
