"use client"

import { Plus } from "lucide-react"

export default function FloatingButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 bg-[#3ddc97] p-4 rounded-full shadow-lg text-white cursor-pointer"
    >
      <Plus size={24} />
    </button>
  )
}
