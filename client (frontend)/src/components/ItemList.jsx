"use client"

import { motion } from "framer-motion"

export default function ItemList({ items, onSelect, onContact, darkMode }) {
  if (items.length === 0) {
    return (
      <motion.div
        className="text-center text-gray-500 mt-10 p-8 bg-white rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Aucun objet à afficher.
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.div
          key={item.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 15px rgba(61, 220, 151, 0.2)" }}
          onClick={() => !item.traite && onSelect(item)}
          className={`
            flex flex-col sm:flex-row items-start sm:items-center justify-between 
            p-3 rounded-2xl shadow-sm cursor-pointer transition-all duration-300 item-style
            ${darkMode ? "bg-[#1e1e2e] text-white" : "bg-white text-[#1e1e2e]"}
            ${item.traite ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <div className="flex-1 w-full sm:w-auto">
            <h3 className={`text-sm font-semibold ${item.traite ? "line-through" : ""}`}>{item.title}</h3>
            <p className="text-xs truncate mt-1">{item.description}</p>
            <div className="flex flex-wrap gap-2 mt-1 text-[11px]">
              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>📍 {item.location}</span>
              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>📅 {item.time}</span>
              {item.author && (
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  👤 {item.author.firstName} {item.author.lastName}
                </span>
              )}
            </div>
          </div>

          <span
            className={`
              px-2.5 py-1 text-[11px] rounded-full whitespace-nowrap mt-2 sm:mt-0
              ${
                item.type === "perdu"
                  ? darkMode
                    ? "bg-red-800 text-red-300"
                    : "bg-red-100 text-red-600 font-semibold"
                  : darkMode
                    ? "bg-green-800 text-green-300"
                    : "bg-green-100 text-green-600 font-semibold"
              }
            `}
          >
            {item.type.toUpperCase()}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
