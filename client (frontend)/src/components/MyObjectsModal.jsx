"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"

export default function MyObjectsModal({ isOpen, onClose, items, darkMode, onOpen }) {
  useEffect(() => {
    if (isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  const handleMarkAsRetrieved = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/lostfound/${itemId}/status`, 
        { status: "retrieved" },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Refresh the items list
      onOpen();
    } catch (err) {
      console.error("Error updating item status:", err);
    }
  };

  if (!isOpen) return null;

  const filteredItems = items.filter(item => item.status === "not retrieved");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Modal content */}
      <motion.div
        className={`relative z-10 w-[90%] max-w-lg max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg border
        ${darkMode ? "bg-[#1e293b] text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"}`}
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold hover:text-red-500"
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          ×
        </motion.button>

        <motion.h2
          className="text-lg font-semibold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Mes objets non récupérés
        </motion.h2>

        {filteredItems.length === 0 ? (
          <motion.p
            className="text-sm italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Aucun objet à récupérer.
          </motion.p>
        ) : (
          <ul className="space-y-4">
            {filteredItems.map((item, index) => (
              <motion.li
                key={item.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`p-4 rounded-lg shadow-sm border 
                ${darkMode ? "bg-[#334155] text-white border-gray-500" : "bg-white text-gray-800 border-gray-200"}`}
              >
                <h3 className="font-bold text-base">{item.title}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="text-sm mt-1 text-gray-400">
                  {item.type === "perdu" ? "Perdu" : "Trouvé"} à {item.location} le {item.time}
                </p>
                <motion.button
                  onClick={() => handleMarkAsRetrieved(item.id)}
                  className="mt-3 px-3 py-1 text-sm font-semibold rounded-md
                  bg-emerald-500 hover:bg-emerald-600 text-white"
                  whileHover={{ scale: 1.05, boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Marquer comme récupéré
                </motion.button>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  )
}
