"use client"

import { useState } from "react"

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotificationHistory)
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    targetRole: "all",
  })
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewNotification((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newId = Math.max(...notifications.map((n) => n.id)) + 1
    const now = new Date().toISOString()

    const notification = {
      id: newId,
      title: newNotification.title,
      content: newNotification.content,
      sentBy: "Admin",
      sentDate: now,
      targetRole: newNotification.targetRole,
      status: "sent",
      readCount: 0,
      totalRecipients:
        newNotification.targetRole === "all" ? 1250 : newNotification.targetRole === "students" ? 1050 : 180,
    }

    setNotifications([notification, ...notifications])
    setNewNotification({
      title: "",
      content: "",
      targetRole: "all",
    })
    setShowForm(false)
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    return matchesSearch && notification.status === filterStatus
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-6 bg-gradient-to-b from-purple-50 to-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-800">Centre de notifications</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all duration-300"
        >
          {showForm ? "Annuler" : "Nouvelle notification"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-purple-100">
          <h3 className="text-lg font-semibold mb-4 text-purple-800">Envoyer une nouvelle notification</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Titre
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newNotification.title}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                Contenu
              </label>
              <textarea
                id="content"
                name="content"
                value={newNotification.content}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="targetRole">
                Destinataires
              </label>
              <select
                id="targetRole"
                name="targetRole"
                value={newNotification.targetRole}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="students">Étudiants uniquement</option>
                <option value="teachers">Enseignants uniquement</option>
                <option value="admins">Administrateurs uniquement</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all duration-300"
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-lg font-semibold mb-4 md:mb-0 text-purple-800">Historique des notifications</h3>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="sent">Envoyé</option>
              <option value="scheduled">Programmé</option>
              <option value="draft">Brouillon</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Titre</th>
                <th className="py-3 px-4 text-left">Date d'envoi</th>
                <th className="py-3 px-4 text-left">Destinataires</th>
                <th className="py-3 px-4 text-left">Statut</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-purple-50 transition-colors">
                    <td className="py-3 px-4 border-b border-gray-100">
                      <div className="font-medium text-gray-800">{notification.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{notification.content}</div>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">{formatDate(notification.sentDate)}</td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      {notification.targetRole === "all"
                        ? "Tous les utilisateurs"
                        : notification.targetRole === "students"
                          ? "Étudiants"
                          : notification.targetRole === "teachers"
                            ? "Enseignants"
                            : "Administrateurs"}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : notification.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {notification.status === "sent"
                          ? "Envoyé"
                          : notification.status === "scheduled"
                            ? "Programmé"
                            : "Brouillon"}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      <button className="text-indigo-600 hover:text-indigo-800 mr-2 font-medium">Détails</button>
                      <button className="text-red-600 hover:text-red-800 font-medium">Supprimer</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    Aucune notification trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
