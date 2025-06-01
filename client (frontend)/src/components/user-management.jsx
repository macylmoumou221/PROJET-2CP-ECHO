"use client"

import { useState } from "react"

export default function UserManagement() {
  const [users, setUsers] = useState(mockAdminUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [actionType, setActionType] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 5

  // Filter users based on search term and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleUserAction = (user, action) => {
    setSelectedUser(user)
    setActionType(action)
    setShowConfirmModal(true)
  }

  const confirmAction = () => {
    if (!selectedUser) return

    let updatedUsers = [...users]
    const userIndex = updatedUsers.findIndex((u) => u.id === selectedUser.id)

    if (userIndex === -1) return

    switch (actionType) {
      case "ban":
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          status: "banned",
          banReason: "Violation of community guidelines",
        }
        break
      case "unban":
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          status: "active",
          banReason: "",
        }
        break
      case "delete":
        updatedUsers = updatedUsers.filter((u) => u.id !== selectedUser.id)
        break
      default:
        break
    }

    setUsers(updatedUsers)
    setShowConfirmModal(false)
    setSelectedUser(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-lg font-semibold mb-4 md:mb-0">Liste des utilisateurs</h3>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full md:w-64"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">Tous les rôles</option>
              <option value="student">Étudiants</option>
              <option value="teacher">Enseignants</option>
              <option value="admin">Administrateurs</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="banned">Banni</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Nom</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Rôle</th>
                <th className="py-2 px-4 border-b text-left">Date d'inscription</th>
                <th className="py-2 px-4 border-b text-left">Statut</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "teacher"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role === "admin" ? "Administrateur" : user.role === "teacher" ? "Enseignant" : "Étudiant"}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{formatDate(user.joinDate)}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : user.status === "inactive"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status === "active" ? "Actif" : user.status === "inactive" ? "Inactif" : "Banni"}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Détails
                      </button>
                      {user.status === "banned" ? (
                        <button
                          onClick={() => handleUserAction(user, "unban")}
                          className="text-green-600 hover:text-green-800 mr-2"
                        >
                          Débannir
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user, "ban")}
                          className="text-orange-600 hover:text-orange-800 mr-2"
                        >
                          Bannir
                        </button>
                      )}
                      <button
                        onClick={() => handleUserAction(user, "delete")}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                &laquo;
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                &raquo;
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Détails de l'utilisateur</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                <p className="font-medium">@{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <p className="font-medium">
                  {selectedUser.role === "admin"
                    ? "Administrateur"
                    : selectedUser.role === "teacher"
                      ? "Enseignant"
                      : "Étudiant"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date d'inscription</p>
                <p className="font-medium">{formatDate(selectedUser.joinDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dernière activité</p>
                <p className="font-medium">{formatDateTime(selectedUser.lastActive)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p
                  className={`font-medium ${
                    selectedUser.status === "active"
                      ? "text-green-600"
                      : selectedUser.status === "inactive"
                        ? "text-gray-600"
                        : "text-red-600"
                  }`}
                >
                  {selectedUser.status === "active"
                    ? "Actif"
                    : selectedUser.status === "inactive"
                      ? "Inactif"
                      : "Banni"}
                </p>
              </div>
              {selectedUser.role === "student" && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Groupe</p>
                    <p className="font-medium">{selectedUser.group || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Promotion</p>
                    <p className="font-medium">{selectedUser.promotion || "N/A"}</p>
                  </div>
                </>
              )}
              {selectedUser.role === "teacher" && (
                <div>
                  <p className="text-sm text-gray-500">Département</p>
                  <p className="font-medium">{selectedUser.department || "N/A"}</p>
                </div>
              )}
              {selectedUser.status === "banned" && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Raison du bannissement</p>
                  <p className="font-medium text-red-600">{selectedUser.banReason}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Fermer
              </button>
              {selectedUser.status === "banned" ? (
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    handleUserAction(selectedUser, "unban")
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Débannir l'utilisateur
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    handleUserAction(selectedUser, "ban")
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Bannir l'utilisateur
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmation</h3>
            {actionType === "ban" && (
              <p>
                Êtes-vous sûr de vouloir bannir l'utilisateur{" "}
                <span className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </span>
                ?
              </p>
            )}
            {actionType === "unban" && (
              <p>
                Êtes-vous sûr de vouloir débannir l'utilisateur{" "}
                <span className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </span>
                ?
              </p>
            )}
            {actionType === "delete" && (
              <p>
                Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur{" "}
                <span className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </span>
                ? Cette action est irréversible.
              </p>
            )}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded text-white ${
                  actionType === "ban"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : actionType === "unban"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
