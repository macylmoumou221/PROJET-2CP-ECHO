import Sidebar from "./Sidebar"

export default function Layout({ children }) {
  const profileImage = null // Assuming profileImage is not available in this component

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="flex justify-end p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden md:inline-block">MACYL MOUMOU</span>
            <img
              src={profileImage || "/placeholder.svg"}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/placeholder.svg?height=32&width=32"
              }}
            />
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
