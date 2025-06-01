"use client"

import { useState } from "react"
import StatCard from "./stat-card"
import { Users, FileText, BarChart2, Bell, X, CheckCircle, MessageSquare, Calendar } from "lucide-react"

export default function DashboardCards({ openCardModal, openSection, activeTimeFilter, dashboardStats }) {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [notificationData, setNotificationData] = useState({
    audience: "allUsers",
    title: "",
    content: "",
  })
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNotificationData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()
    setIsSending(true)

    try {
      // In a real app, this would be an API call
      // await fetch('/api/admin/send-notification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notificationData)
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSendSuccess(true)
      setTimeout(() => {
        setShowNotificationForm(false)
        setSendSuccess(false)
        setNotificationData({
          audience: "allUsers",
          title: "",
          content: "",
        })
      }, 1500)
    } catch (error) {
      console.error("Error sending notification:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleCardClick = (cardId) => {
    // Open the corresponding section directly
    openSection(cardId)
  }

  return (
    <div className="w-full">
      {/* Notification Form Modal */}
      {showNotificationForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative overflow-hidden">
            {/* Decorative header */}
            <div className="h-2 w-full bg-gradient-to-r from-[#3ddc97] to-[#2bb583]"></div>

            <button
              onClick={() => setShowNotificationForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              disabled={isSending}
            >
              <X size={20} />
            </button>

            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#3ddc97] to-[#2bb583] text-white shadow-md mr-3">
                  <Bell size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Send Notification</h2>
              </div>

              {sendSuccess ? (
                <div className="bg-[#e6f9f1] border-l-4 border-[#3ddc97] p-4 rounded-lg mb-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-[#3ddc97] mr-2" />
                    <p className="text-sm text-[#1e8e68]">Notification sent successfully!</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                    <select
                      name="audience"
                      value={notificationData.audience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#3ddc97] focus:ring focus:ring-[#3ddc97]/20 focus:outline-none transition-all duration-200"
                      required
                      disabled={isSending}
                    >
                      <option value="allUsers">All Users</option>
                      <option value="students">Students Only</option>
                      <option value="teachers">Teachers Only</option>
                      <option value="admins">Administrators Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
                    <input
                      type="text"
                      name="title"
                      value={notificationData.title}
                      onChange={handleInputChange}
                      placeholder="Enter title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#3ddc97] focus:ring focus:ring-[#3ddc97]/20 focus:outline-none transition-all duration-200"
                      required
                      disabled={isSending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Content</label>
                    <textarea
                      name="content"
                      value={notificationData.content}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter content"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#3ddc97] focus:ring focus:ring-[#3ddc97]/20 focus:outline-none transition-all duration-200"
                      required
                      disabled={isSending}
                    />
                  </div>

                  <div className="bg-[#e6f9f1] border-l-4 border-[#3ddc97] p-3 rounded-lg">
                    <p className="text-sm text-[#1e8e68]">
                      <span className="font-medium">Note:</span> This notification will be sent to{" "}
                      {notificationData.audience === "allUsers"
                        ? "all users"
                        : notificationData.audience === "students"
                          ? "students only"
                          : notificationData.audience === "teachers"
                            ? "teachers only"
                            : "administrators only"}{" "}
                      upon their next login.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#3ddc97] to-[#2bb583] text-white py-3 px-4 rounded-lg mt-4 flex items-center justify-center shadow-md hover:shadow-lg hover:from-[#2bb583] hover:to-[#1e8e68] transition-all duration-300 font-medium"
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      "Send Notification"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Cards Grid - 3x2 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* User Management Card */}
        <StatCard
          id="users"
          title="User Management"
          icon={<Users size={20} />}
          primaryStat={dashboardStats?.activeUsers || 0}
          primaryLabel="Active Users"
          secondaryStat={dashboardStats?.roleDistribution?.students || 0}
          secondaryLabel="Students"
          color="green"
          onClick={() => handleCardClick("users")}
          onMouseEnter={() => setHoveredCard("users")}
          onMouseLeave={() => setHoveredCard(null)}
          isHovered={hoveredCard === "users"}
        />

        {/* Content Moderation Card */}
        <StatCard
          id="content"
          title="Content Moderation"
          icon={<FileText size={20} />}
          primaryStat={dashboardStats?.reportedContent || 0}
          primaryLabel="Reported Posts"
          secondaryStat={dashboardStats?.reportedLostFound || 0}
          secondaryLabel="Reported Items"
          color="emerald"
          onClick={() => handleCardClick("content")}
          onMouseEnter={() => setHoveredCard("content")}
          onMouseLeave={() => setHoveredCard(null)}
          isHovered={hoveredCard === "content"}
        />

        {/* Analytics Dashboard Card */}
        <StatCard
          id="analytics"
          title="Analytics Dashboard"
          icon={<BarChart2 size={20} />}
          primaryStat={dashboardStats?.newPosts || 0}
          primaryLabel="New Posts"
          secondaryStat={dashboardStats?.newClaims || 0}
          secondaryLabel="New Claims"
          color="teal"
          onClick={() => handleCardClick("analytics")}
          onMouseEnter={() => setHoveredCard("analytics")}
          onMouseLeave={() => setHoveredCard(null)}
          isHovered={hoveredCard === "analytics"}
        />

        {/* Notification Center Card */}
        <StatCard
          id="notifications"
          title="Notification Center"
          icon={<Bell size={20} />}
          primaryStat={dashboardStats?.pendingNotifications || 0}
          primaryLabel="Pending Notifications"
          secondaryStat={
            activeTimeFilter === "today" ? "Today" : activeTimeFilter === "week" ? "This Week" : "This Month"
          }
          secondaryLabel="Time Period"
          color="lime"
          onClick={() => handleCardClick("notifications")}
          onMouseEnter={() => setHoveredCard("notifications")}
          onMouseLeave={() => setHoveredCard(null)}
          isHovered={hoveredCard === "notifications"}
        />

        {/* Claims Overview Card */}
        <StatCard
          id="claims"
          title="Claims Overview"
          icon={<MessageSquare size={20} />}
          primaryStat={dashboardStats?.pendingClaims || 0}
          primaryLabel="Pending Claims"
          secondaryStat={dashboardStats?.resolvedClaims || 0}
          secondaryLabel="Resolved Claims"
          color="cyan"
          onClick={() => handleCardClick("claims")}
          onMouseEnter={() => setHoveredCard("claims")}
          onMouseLeave={() => setHoveredCard(null)}
          isHovered={hoveredCard === "claims"}
        />

        {/* Event Management Card */}
        <StatCard
          id="events"
          title="Event Management"
          icon={<Calendar size={20} />}
          primaryStat={dashboardStats?.totalEvents || 0}
          primaryLabel="Total Events"
          secondaryStat={dashboardStats?.upcomingEvents || 0}
          secondaryLabel="Upcoming Events"
          color="green"
          onClick={() => handleCardClick("events")}
          onMouseEnter={() => setHoveredCard("events")}
          onMouseLeave={() => setHoveredCard(null)}
          isHovered={hoveredCard === "events"}
        />
      </div>
    </div>
  )
}
