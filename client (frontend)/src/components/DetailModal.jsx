"use client"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

// Enhance DetailModal with animations and vibrant colors
export default function DetailModal({ isOpen, onClose, item }) {
  const navigate = useNavigate()
  const hasImage = !!item?.image // Check if there's an image
  const modalWidth = hasImage ? "w-[60%] max-w-3xl" : "w-[40%] max-w-md" // Adjust width

  if (!isOpen) return null

  const handleRepondre = () => {
    // Determine message based on item type
    const message =
      item?.type === "perdu" ? "Je crois que j'ai trouvé ton objet" : "Je crois que cet objet m'appartient"

    // Navigate to messagerie with the author and pre-filled message
    navigate("/messagerie", {
      state: {
        contactUser: item?.author,
        initialMessage: message,
        itemReference: {
          id: item?.id,
          title: item?.title,
          type: item?.type,
        },
      },
    })

    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bg-[#1e1e2e] rounded-2xl shadow-xl ${modalWidth} max-h-[80vh] flex overflow-hidden relative select-none`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Item Details */}
        <div className={`p-8 flex flex-col text-white space-y-4 ${hasImage ? "w-1/2" : "w-full"} overflow-auto`}>
          <div className="flex flex-col space-y-2">
            <motion.h2
              className="text-3xl font-bold uppercase text-[#3ddc97]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {item?.title}
            </motion.h2>
            <motion.p
              className="text-sm text-gray-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {item?.author?.firstName} {item?.author?.lastName}
            </motion.p>
            <motion.p
              className="text-base text-gray-400 mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {item?.time} | {item?.location}
            </motion.p>
            <motion.p
              className="text-xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Description
            </motion.p>
            <motion.p
              className="text-lg leading-relaxed break-words whitespace-pre-wrap"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {item?.description}
            </motion.p>
          </div>
          <motion.button
            className="w-full bg-gradient-to-r from-[#3ddc97] to-white text-[#1e1e2e] py-2 rounded-lg text-lg font-semibold shadow-md hover:opacity-90 transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(61, 220, 151, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={handleRepondre}
          >
            Répondre
          </motion.button>
        </div>

        {/* Right Side - Image with Frame (Only if there's an image) */}
        {hasImage && (
          <motion.div
            className="w-1/2 flex items-center justify-center p-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="border-4 border-[#1e1e2e] rounded-lg overflow-hidden w-full h-full flex items-center justify-center">
              <img src={item?.image || "/placeholder.svg"} alt={item?.title} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        )}

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-700 p-1 rounded-full hover:bg-gray-600 cursor-pointer"
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
