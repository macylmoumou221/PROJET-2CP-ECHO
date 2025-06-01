"use client"

import { Plus } from "lucide-react"

export default function FloatingButtonLF({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-300 hover:scale-110"
      style={{ backgroundColor: "#3ddc97", color: "white" }}
    >
      <Plus size={24} />
    </button>
  )
}
