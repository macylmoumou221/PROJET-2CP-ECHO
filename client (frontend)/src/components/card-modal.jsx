"use client"

export default function CardModal({ cardData, onClose, openSection }) {
  if (!cardData) return null

  const handleViewDetails = () => {
    onClose()
    openSection(cardData.id)
  }

  // Define color schemes based on the card id
  const getColorScheme = (cardId) => {
    const colorSchemes = {
      users: {
        gradient: "from-teal-500 to-emerald-500",
        bg: "bg-teal-50",
        border: "border-teal-200",
      },
      content: {
        gradient: "from-emerald-500 to-green-500",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      },
      analytics: {
        gradient: "from-purple-500 to-violet-500",
        bg: "bg-purple-50",
        border: "border-purple-200",
      },
      notifications: {
        gradient: "from-amber-500 to-yellow-500",
        bg: "bg-amber-50",
        border: "border-amber-200",
      },
      claims: {
        gradient: "from-rose-500 to-pink-500",
        bg: "bg-rose-50",
        border: "border-rose-200",
      },
      events: {
        gradient: "from-indigo-500 to-blue-500",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
      },
    }

    return colorSchemes[cardId] || colorSchemes.users
  }

  const colorScheme = getColorScheme(cardData.id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl max-w-md w-full p-6 shadow-xl border ${colorScheme.border}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{cardData.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            {cardData.id === "users" && "Manage users, roles, and permissions. View user statistics and activity."}
            {cardData.id === "content" && "Review reported content, moderate posts, and manage lost & found items."}
            {cardData.id === "analytics" && "View platform statistics, user activity, and content metrics."}
            {cardData.id === "notifications" && "Send announcements to users and view notification history."}
            {cardData.id === "claims" && "Monitor all claims, view their status, and track resolution rates."}
            {cardData.id === "events" && "Create and manage events like exams, holidays, and deadlines."}
          </p>

          <div className={`${colorScheme.bg} p-4 rounded-lg`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{cardData.primaryLabel}</p>
                <p className="text-xl font-bold">{cardData.primaryStat}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{cardData.secondaryLabel}</p>
                <p className="text-xl font-bold">{cardData.secondaryStat}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleViewDetails}
            className={`px-4 py-2 bg-gradient-to-r ${colorScheme.gradient} text-white rounded-lg hover:opacity-90 shadow-md transition-all duration-300`}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
