"use client"

import { useState, useEffect } from "react"
import DashboardCards from "./dashboard-cards"
import CardModal from "./card-modal"
import UserManagement from "./user-management"
import ContentModeration from "./content-moderation"
import AnalyticsDashboard from "./analytics-dashboard"
import NotificationCenter from "./notification-center"
import ClaimsOverview from "./claims-overview"
import EventManagement from "./event-management"

export default function Dashboard() {
  const [activeTimeFilter, setActiveTimeFilter] = useState("today")
  const [selectedCard, setSelectedCard] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch dashboard statistics when time filter changes
    fetchDashboardStats(activeTimeFilter)
  }, [activeTimeFilter])

  const fetchDashboardStats = async (timeFilter) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/admin/dashboard-stats?timeFilter=${timeFilter}`)
      // const data = await response.json()

      // For now, we'll use mock data
      const mockData = {
        today: {
          activeUsers: 245,
          totalPosts: 1289,
          reportedContent: 12,
          reportedLostFound: 5,
          newPosts: 37,
          newClaims: 8,
          newLostFound: 15,
          pendingNotifications: 3,
          pendingClaims: 14,
          resolvedClaims: 6,
          totalEvents: 8,
          upcomingEvents: 3,
          roleDistribution: {
            students: 1250,
            teachers: 85,
            admins: 15,
          },
        },
        week: {
          activeUsers: 780,
          totalPosts: 1289,
          reportedContent: 28,
          reportedLostFound: 12,
          newPosts: 124,
          newClaims: 32,
          newLostFound: 47,
          pendingNotifications: 5,
          pendingClaims: 28,
          resolvedClaims: 24,
          totalEvents: 15,
          upcomingEvents: 7,
          roleDistribution: {
            students: 1250,
            teachers: 85,
            admins: 15,
          },
        },
        month: {
          activeUsers: 1100,
          totalPosts: 1289,
          reportedContent: 56,
          reportedLostFound: 23,
          newPosts: 320,
          newClaims: 87,
          newLostFound: 112,
          pendingNotifications: 8,
          pendingClaims: 45,
          resolvedClaims: 76,
          totalEvents: 32,
          upcomingEvents: 12,
          roleDistribution: {
            students: 1250,
            teachers: 85,
            admins: 15,
          },
        },
      }

      setDashboardStats(mockData[timeFilter])
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setIsLoading(false)
    }
  }

  const handleTimeFilterChange = (filter) => {
    setActiveTimeFilter(filter)
  }

  const openCardModal = (card) => {
    setSelectedCard(card)
  }

  const closeCardModal = () => {
    setSelectedCard(null)
  }

  const openSection = (sectionId) => {
    setActiveSection(sectionId)
    setSelectedCard(null)
  }

  const closeSection = () => {
    setActiveSection(null)
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "users":
        return <UserManagement onClose={closeSection} />
      case "content":
        return <ContentModeration onClose={closeSection} />
      case "analytics":
        return <AnalyticsDashboard onClose={closeSection} timeFilter={activeTimeFilter} />
      case "notifications":
        return <NotificationCenter onClose={closeSection} />
      case "claims":
        return <ClaimsOverview onClose={closeSection} />
      case "events":
        return <EventManagement onClose={closeSection} />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (activeSection) {
    return renderActiveSection()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => handleTimeFilterChange("today")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTimeFilter === "today"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => handleTimeFilterChange("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTimeFilter === "week"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cette Semaine
          </button>
          <button
            onClick={() => handleTimeFilterChange("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTimeFilter === "month"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Ce Mois
          </button>
        </div>
      </div>

      <DashboardCards
        openCardModal={openCardModal}
        openSection={openSection}
        activeTimeFilter={activeTimeFilter}
        dashboardStats={dashboardStats}
      />

      {selectedCard && <CardModal cardData={selectedCard} onClose={closeCardModal} openSection={openSection} />}
    </div>
  )
}
