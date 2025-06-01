"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Filter, X, MessageSquare, User, Calendar, Eye } from "lucide-react"

export default function ClaimsOverview({ onClose }) {
  const [claims, setClaims] = useState([])
  const [filteredClaims, setFilteredClaims] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    dealt: 0,
    rejected: 0,
    resolutionRate: 0,
  })

  useEffect(() => {
    // In a real app, this would be an API call
    // const fetchClaims = async () => {
    //   const response = await fetch('/api/admin/claims')
    //   const data = await response.json()
    //   setClaims(data)
    //   setFilteredClaims(data)
    // }
    // fetchClaims()

    // For now, we'll use mock data
    setClaims(mockClaims)
    setFilteredClaims(mockClaims)

    // Calculate stats
    const total = mockClaims.length
    const pending = mockClaims.filter((claim) => claim.status === "pending").length
    const dealt = mockClaims.filter((claim) => claim.status === "dealt").length
    const rejected = mockClaims.filter((claim) => claim.status === "rejected").length
    const resolutionRate = total > 0 ? Math.round(((dealt + rejected) / total) * 100) : 0

    setStats({
      total,
      pending,
      dealt,
      rejected,
      resolutionRate,
    })
  }, [])

  useEffect(() => {
    let result = claims

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (claim) =>
          claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.studentName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((claim) => claim.status === statusFilter)
    }

    setFilteredClaims(result)
  }, [searchTerm, statusFilter, claims])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
  }

  const handleSelectClaim = (claim) => {
    setSelectedClaim(claim)
  }

  const handleCloseDetail = () => {
    setSelectedClaim(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "dealt":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={onClose}
            className="mr-4 p-2 rounded-full hover:bg-red-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-red-700" />
          </button>
          <h1 className="text-2xl font-bold text-red-800">Claims Overview</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-400">
            <h3 className="text-sm font-medium text-gray-500">Total Claims</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-400">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-400">
            <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
            <p className="text-2xl font-bold text-green-600">{stats.dealt}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-400">
            <h3 className="text-sm font-medium text-gray-500">Resolution Rate</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.resolutionRate}%</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Claims List */}
          <div className={`bg-white rounded-xl shadow-md p-4 ${selectedClaim ? "hidden md:block md:w-1/2" : "w-full"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h2 className="text-lg font-semibold mb-2 sm:mb-0 text-red-800">All Claims</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-9 pr-4 py-2 border border-red-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" size={16} />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-red-200 rounded-lg appearance-none w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="dealt">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" size={16} />
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
              {filteredClaims.length > 0 ? (
                <div className="divide-y divide-red-100">
                  {filteredClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className={`py-3 px-2 hover:bg-red-50 cursor-pointer transition-colors rounded-lg my-1 ${
                        selectedClaim?.id === claim.id ? "bg-red-50 border border-red-200" : ""
                      }`}
                      onClick={() => handleSelectClaim(claim)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-gray-900">{claim.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(claim.status)}`}
                        >
                          {claim.status === "pending" ? "Pending" : claim.status === "dealt" ? "Resolved" : "Rejected"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <User size={14} className="mr-1" />
                        <span>{claim.studentName}</span>
                        <span className="mx-2">•</span>
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(claim.date)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{claim.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-red-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
                  <p className="mt-1 text-sm text-gray-500">No claims match your current filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Claim Detail */}
          {selectedClaim && (
            <div className="bg-white rounded-xl shadow-md p-4 md:w-1/2">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-red-800">Claim Details</h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Preview Only</span>
                  <Eye size={16} className="text-red-500 mr-2" />
                  <button
                    onClick={handleCloseDetail}
                    className="p-2 rounded-full hover:bg-red-100 transition-colors"
                    aria-label="Close details"
                  >
                    <X size={20} className="text-red-500" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{selectedClaim.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedClaim.status)}`}
                  >
                    {selectedClaim.status === "pending"
                      ? "Pending"
                      : selectedClaim.status === "dealt"
                        ? "Resolved"
                        : "Rejected"}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User size={14} className="mr-1" />
                  <span className="font-medium">{selectedClaim.studentName}</span>
                  <span className="mx-2">•</span>
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(selectedClaim.date)}</span>
                </div>

                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-medium text-red-700 mb-2">Claim Description</h4>
                  <p className="text-gray-600">{selectedClaim.description}</p>
                </div>

                {selectedClaim.status !== "pending" && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Response</h4>
                    <p className="text-gray-600">{selectedClaim.response}</p>
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg mt-6 border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Note:</span> As an administrator, you can only view claims. Processing
                    claims is handled by the teaching staff.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
