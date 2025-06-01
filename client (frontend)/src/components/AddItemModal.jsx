"use client"
import { X } from "lucide-react"
import { motion } from "framer-motion"

// Enhance AddItemModal with animations and vibrant colors
export default function AddItemModal({ isOpen, onClose, newItem, setNewItem, onAdd, darkMode }) {
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewItem({ ...newItem, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const currentDate = new Date().toISOString().split("T")[0]

  const handleDateChange = () => {
    setNewItem({ ...newItem, time: currentDate })
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Overlay with blur */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal content */}
      <motion.div
        className="relative bg-white dark:bg-[#1e1e2e] text-[#1e1e2e] dark:text-white p-6 rounded-xl shadow-xl w-[90%] max-w-3xl select-none transition-all"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <motion.button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} />
        </motion.button>

        <motion.h2
          className="text-xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Objet trouvé/perdu
        </motion.h2>

        {/* Form elements with staggered animations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <select
            className="w-full p-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-[#f4f7f9] dark:bg-[#2a2a3d] text-sm focus:outline-none focus:border-[#A0E6D7] focus:ring-2 focus:ring-[#A0E6D7] transition-all duration-300"
            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            value={newItem.type}
          >
            <option value="">Sélectionner...</option>
            <option value="perdu">Perdu</option>
            <option value="trouvé">Trouvé</option>
          </select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <input
            type="text"
            placeholder="L'objet"
            className="w-full p-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-[#f4f7f9] dark:bg-[#2a2a3d] text-sm placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-[#3ddc97] focus:border-[#3ddc97]"
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            value={newItem.title}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <textarea
            placeholder="Description"
            className="w-full p-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-[#f4f7f9] dark:bg-[#2a2a3d] text-sm placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-[#3ddc97] focus:border-[#3ddc97]"
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            value={newItem.description}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <input
            type="text"
            placeholder="Lieu"
            className="w-full p-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-[#f4f7f9] dark:bg-[#2a2a3d] text-sm placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-[#3ddc97] focus:border-[#3ddc97]"
            onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
            value={newItem.location}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <input
            type="file"
            accept="image/*"
            className="w-full p-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-[#f4f7f9] dark:bg-[#2a2a3d] text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#e5e7eb] file:text-gray-700 dark:file:bg-[#44465a] dark:file:text-white transition-all duration-300"
            onChange={handleImageChange}
          />
        </motion.div>

        {/* Date cachée */}
        <input type="hidden" value={currentDate} onChange={handleDateChange} />

        {/* Bouton Ajouter */}
        <motion.button
          onClick={onAdd}
          className="w-full mt-2 p-2 rounded font-medium bg-gradient-to-r from-[#1e1e2e] to-[#3ddc97] dark:bg-gradient-to-r dark:from-[#3ddc97] dark:to-[#A0E6D7] text-white dark:text-[#1e1e2e] hover:opacity-90 transition-all duration-300"
          whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(61, 220, 151, 0.4)" }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Ajouter
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
