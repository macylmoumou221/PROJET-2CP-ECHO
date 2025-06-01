"use client"

import { useState, useEffect } from "react"

export default function ContentModeration({ onClose }) {
  const [reportedContent, setReportedContent] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: "all",
    status: "pending",
    search: "",
  })
  const [approveConfirmation, setApproveConfirmation] = useState(null)
  const [removeConfirmation, setRemoveConfirmation] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    // Fetch reported content
    fetchReportedContent()
  }, [])

  const fetchReportedContent = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/admin/reported-posts');
      // const data = await response.json();

      // Using mock data for now
      setTimeout(() => {
        setReportedContent(mockReportedContent)
        setIsLoading(false)
      }, 500) // Simulate network delay
    } catch (error) {
      console.error("Error fetching reported content:", error)
      setIsLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
    setCurrentPage(1) // Reset to first page when filters change
  }

  const filteredContent = reportedContent.filter((item) => {
    // Filter by type
    if (filters.type !== "all" && item.type !== filters.type) {
      return false
    }

    // Filter by status
    if (filters.status !== "all" && item.status !== filters.status) {
      return false
    }

    // Filter by search term
    if (
      filters.search &&
      !item.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !item.reportReason.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage)
  const paginatedContent = filteredContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleApproveClick = (item) => {
    setApproveConfirmation(item)
  }

  const handleRemoveClick = (item) => {
    setRemoveConfirmation(item)
  }

  const handleApproveContent = async () => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/admin/posts/${approveConfirmation.id}/moderate`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ action: 'approve' }),
      // });
      // const data = await response.json();

      // Update content in the local state
      const updatedContent = reportedContent.map((item) => {
        if (item.id === approveConfirmation.id) {
          return {
            ...item,
            status: "approved",
          }
        }
        return item
      })

      setReportedContent(updatedContent)
      setApproveConfirmation(null)
      setSuccessMessage("Content approved successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error approving content:", error)
    }
  }

  const handleRemoveContent = async () => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/admin/posts/${removeConfirmation.id}/moderate`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ action: 'remove' }),
      // });
      // const data = await response.json();

      // Update content in the local state
      const updatedContent = reportedContent.map((item) => {
        if (item.id === removeConfirmation.id) {
          return {
            ...item,
            status: "removed",
          }
        }
        return item
      })

      setReportedContent(updatedContent)
      setRemoveConfirmation(null)
      setSuccessMessage("Content removed successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error removing content:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reported content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Content Moderation</h2>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700">
            Back to Dashboard
          </button>
        </div>

        {successMessage && <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">{successMessage}</div>}

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="post">Posts</option>
                <option value="lostfound">Lost & Found</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="removed">Removed</option>
              </select>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title or report reason"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Reported Content List */}
        <div className="space-y-4">
          {paginatedContent.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No reported content found matching the filters</p>
            </div>
          ) : (
            paginatedContent.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          item.type === "post" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        } mr-2`}
                      >
                        {item.type === "post" ? "Post" : "Lost & Found"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          item.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">
                        Reported by: {item.reportedBy} • {new Date(item.reportedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-medium text-red-600 mt-1">Report reason: {item.reportReason}</p>
                    </div>
                  </div>

                  {item.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveClick(item)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRemoveClick(item)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      {approveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-2">Approve Content</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this content? It will remain visible to all users.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setApproveConfirmation(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveContent}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {removeConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-2">Remove Content</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove this content? It will no longer be visible to users. This action cannot be
              undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRemoveConfirmation(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveContent}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
