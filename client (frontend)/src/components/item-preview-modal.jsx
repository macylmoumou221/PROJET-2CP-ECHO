"use client"

import { X } from "lucide-react"

export default function ItemPreviewModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-[30px] w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#3DDC97] text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Item Details</h2>
          <button onClick={onClose} className="bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-64 object-cover rounded-xl border border-gray-200"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.type === "Lost" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {item.type}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{item.location}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{item.date}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{item.description}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium mb-3">Moderation Actions</h4>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-[#3DDC97] text-white rounded-lg hover:bg-[#2eba7d]">
                Mark as Resolved
              </button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                Flag for Review
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Remove Item</button>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
