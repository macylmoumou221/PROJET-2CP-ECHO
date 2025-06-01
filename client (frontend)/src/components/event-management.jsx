"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, Plus, Search, Filter, Edit, Trash2, X, Eye, EyeOff, Users } from "lucide-react"

export default function EventManagement({ onClose }) {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventFormData, setEventFormData] = useState({
    title: "",
    date: "",
    time: "",
    type: "lecture",
    visibility: "all",
    targetGroups: [],
    targetPromotions: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Convert mockEvents object to array for easier handling
  useEffect(() => {
    const eventsArray = []
    Object.keys(mockEvents).forEach((date) => {
      mockEvents[date].forEach((event) => {
        eventsArray.push({
          ...event,
          date,
          visibility: event.visibility || "all", // Default visibility
          targetGroups: event.targetGroups || [], // Default target groups
          targetPromotions: event.targetPromotions || [], // Default target promotions
        })
      })
    })

    // Sort events by date
    eventsArray.sort((a, b) => new Date(a.date) - new Date(b.date))

    setEvents(eventsArray)
    setFilteredEvents(eventsArray)
  }, [])

  useEffect(() => {
    let result = events

    // Apply search filter
    if (searchTerm) {
      result = result.filter((event) => event.title.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((event) => event.type === typeFilter)
    }

    setFilteredEvents(result)
  }, [searchTerm, typeFilter, events])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleTypeFilter = (type) => {
    setTypeFilter(type)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEventFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTargetGroupChange = (e) => {
    const { value, checked } = e.target

    setEventFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          targetGroups: [...prev.targetGroups, value],
        }
      } else {
        return {
          ...prev,
          targetGroups: prev.targetGroups.filter((group) => group !== value),
        }
      }
    })
  }

  const handleTargetPromotionChange = (e) => {
    const { value, checked } = e.target

    setEventFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          targetPromotions: [...prev.targetPromotions, value],
        }
      } else {
        return {
          ...prev,
          targetPromotions: prev.targetPromotions.filter((promotion) => promotion !== value),
        }
      }
    })
  }

  const handleAddEvent = () => {
    setSelectedEvent(null)
    setEventFormData({
      title: "",
      date: new Date().toISOString().split("T")[0], // Today's date
      time: "",
      type: "lecture",
      visibility: "all",
      targetGroups: [],
      targetPromotions: [],
    })
    setShowEventForm(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setEventFormData({
      title: event.title,
      date: event.date,
      time: event.time.split(" - ")[0], // Just take the start time
      type: event.type,
      visibility: event.visibility || "all",
      targetGroups: event.targetGroups || [],
      targetPromotions: event.targetPromotions || [],
    })
    setShowEventForm(true)
  }

  const handleCloseForm = () => {
    setShowEventForm(false)
    setSelectedEvent(null)
  }

  const handleSubmitEvent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      // const endpoint = selectedEvent ? `/api/admin/events/${selectedEvent.id}` : '/api/admin/events'
      // const method = selectedEvent ? 'PUT' : 'POST'
      // await fetch(endpoint, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventFormData)
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (selectedEvent) {
        // Update existing event
        const updatedEvents = events.map((event) => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              title: eventFormData.title,
              date: eventFormData.date,
              time: `${eventFormData.time} - ${Number.parseInt(eventFormData.time.split(":")[0]) + 2}:${
                eventFormData.time.split(":")[1]
              }`, // Add 2 hours to start time
              type: eventFormData.type,
              visibility: eventFormData.visibility,
              targetGroups: eventFormData.targetGroups,
              targetPromotions: eventFormData.targetPromotions,
            }
          }
          return event
        })
        setEvents(updatedEvents)
      } else {
        // Add new event
        const newEvent = {
          id: Math.max(...events.map((e) => e.id), 0) + 1,
          title: eventFormData.title,
          date: eventFormData.date,
          time: `${eventFormData.time} - ${Number.parseInt(eventFormData.time.split(":")[0]) + 2}:${
            eventFormData.time.split(":")[1]
          }`, // Add 2 hours to start time
          type: eventFormData.type,
          visibility: eventFormData.visibility,
          targetGroups: eventFormData.targetGroups,
          targetPromotions: eventFormData.targetPromotions,
        }
        setEvents([...events, newEvent])
      }

      setShowEventForm(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error("Error submitting event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (event) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      // In a real app, this would be an API call
      // await fetch(`/api/admin/events/${event.id}`, {
      //   method: 'DELETE'
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Remove event from state
      setEvents(events.filter((e) => e.id !== event.id))
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getEventTypeLabel = (type) => {
    switch (type) {
      case "lecture":
        return "Lecture"
      case "exam":
        return "Exam"
      case "td":
        return "TD"
      case "tp":
        return "TP"
      case "meeting":
        return "Meeting"
      case "conference":
        return "Conference"
      case "holiday":
        return "Holiday"
      case "deadline":
        return "Deadline"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case "lecture":
        return "bg-[#c0f0dd] text-[#1e8e68]"
      case "exam":
        return "bg-red-100 text-red-800"
      case "td":
        return "bg-[#e6f9f1] text-[#1e8e68]"
      case "tp":
        return "bg-purple-100 text-purple-800"
      case "meeting":
        return "bg-yellow-100 text-yellow-800"
      case "conference":
        return "bg-[#c0f0dd] text-[#1e8e68]"
      case "holiday":
        return "bg-teal-100 text-teal-800"
      case "deadline":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case "all":
        return "All Users"
      case "students":
        return "Students Only"
      case "teachers":
        return "Teachers Only"
      default:
        return visibility
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f9f1] to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="mr-4 p-2 rounded-full hover:bg-[#c0f0dd] transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-[#1e8e68]" />
            </button>
            <h1 className="text-2xl font-bold text-[#1e8e68]">Event Management</h1>
          </div>
          <button
            onClick={handleAddEvent}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#3ddc97] to-[#2bb583] text-white rounded-lg hover:shadow-lg hover:from-[#2bb583] hover:to-[#1e8e68] shadow-md transition-all duration-300"
          >
            <Plus size={16} className="mr-2" />
            Add Event
          </button>
        </div>

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative overflow-hidden">
              {/* Decorative header */}
              <div className="h-2 w-full bg-gradient-to-r from-[#3ddc97] to-[#2bb583]"></div>

              <button
                onClick={handleCloseForm}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>

              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#3ddc97] to-[#2bb583] text-white shadow-md mr-3">
                    <Calendar size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedEvent ? "Edit Event" : "Add New Event"}</h2>
                </div>

                <form onSubmit={handleSubmitEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                      Event Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={eventFormData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#3ddc97] focus:ring focus:ring-[#3ddc97]/20 focus:outline-none transition-all duration-200"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={eventFormData.date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#3ddc97] focus:ring focus:ring-[#3ddc97]/20 focus:outline-none transition-all duration-200"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time">
                        Start Time
                      </label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={eventFormData.time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#3ddc97] focus:ring focus:ring-[#3ddc97]/20 focus:outline-none transition-all duration-200"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">
                        Event Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={eventFormData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#3ddc97] focus:ring focus:ring-[#3ddc97]/20 focus:outline-none transition-all duration-200"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="lecture">Lecture</option>
                        <option value="exam">Exam</option>
                        <option value="td">TD</option>
                        <option value="tp">TP</option>
                        <option value="meeting">Meeting</option>
                        <option value="conference">Conference</option>
                        <option value="holiday">Holiday</option>
                        <option value="deadline">Deadline</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="visibility">
                        Visibility
                      </label>
                      <select
                        id="visibility"
                        name="visibility"
                        value={eventFormData.visibility}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#3ddc97] focus:ring focus:ring-[#3ddc97]/20 focus:outline-none transition-all duration-200"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="all">All Users</option>
                        <option value="students">Students Only</option>
                        <option value="teachers">Teachers Only</option>
                      </select>
                    </div>
                  </div>

                  {eventFormData.visibility === "students" && (
                    <>
                      <div>
                        <div className="flex items-center mb-2">
                          <Users size={16} className="mr-2 text-[#1e8e68]" />
                          <label className="text-sm font-medium text-gray-700">Target Groups</label>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-lg bg-[#f9fdfb]">
                          {["G01", "G02", "G03", "G04", "G05", "G06"].map((group) => (
                            <div key={group} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`group-${group}`}
                                value={group}
                                checked={eventFormData.targetGroups.includes(group)}
                                onChange={handleTargetGroupChange}
                                className="h-4 w-4 text-[#3ddc97] border-gray-300 rounded focus:ring-[#3ddc97]"
                                disabled={isSubmitting}
                              />
                              <label htmlFor={`group-${group}`} className="ml-2 text-sm text-gray-700">
                                {group}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <Calendar size={16} className="mr-2 text-[#1e8e68]" />
                          <label className="text-sm font-medium text-gray-700">Target Promotions</label>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-lg bg-[#f9fdfb]">
                          {["1CP", "2CP", "1CS", "2CS", "3CS", "1CY", "2CY", "3CY"].map((promotion) => (
                            <div key={promotion} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`promotion-${promotion}`}
                                value={promotion}
                                checked={eventFormData.targetPromotions.includes(promotion)}
                                onChange={handleTargetPromotionChange}
                                className="h-4 w-4 text-[#3ddc97] border-gray-300 rounded focus:ring-[#3ddc97]"
                                disabled={isSubmitting}
                              />
                              <label htmlFor={`promotion-${promotion}`} className="ml-2 text-sm text-gray-700">
                                {promotion}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#3ddc97] to-[#2bb583] text-white rounded-lg hover:shadow-lg hover:from-[#2bb583] hover:to-[#1e8e68] shadow-md transition-all duration-300 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span>{selectedEvent ? "Updating..." : "Creating..."}</span>
                        </div>
                      ) : selectedEvent ? (
                        "Update Event"
                      ) : (
                        "Create Event"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#3ddc97]/10 to-[#2bb583]/10 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-lg font-bold mb-2 sm:mb-0 text-[#1e8e68]">All Events</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-9 pr-4 py-2 border border-[#3ddc97]/30 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#3ddc97]/50 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3ddc97]" size={16} />
                </div>
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => handleTypeFilter(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-[#3ddc97]/30 rounded-lg appearance-none w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-[#3ddc97]/50 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="lecture">Lectures</option>
                    <option value="exam">Exams</option>
                    <option value="td">TDs</option>
                    <option value="tp">TPs</option>
                    <option value="meeting">Meetings</option>
                    <option value="conference">Conferences</option>
                    <option value="holiday">Holidays</option>
                    <option value="deadline">Deadlines</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3ddc97]" size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f9fdfb]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#1e8e68] uppercase tracking-wider"
                  >
                    Event
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#1e8e68] uppercase tracking-wider"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#1e8e68] uppercase tracking-wider"
                  >
                    Visibility
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#1e8e68] uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-[#f9fdfb] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(
                                event.type,
                              )}`}
                            >
                              {getEventTypeLabel(event.type)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                        <div className="text-sm text-gray-500">{event.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          {event.visibility === "all" ? (
                            <Eye size={16} className="mr-1 text-[#3ddc97]" />
                          ) : (
                            <EyeOff size={16} className="mr-1 text-[#3ddc97]" />
                          )}
                          <span>{getVisibilityLabel(event.visibility)}</span>

                          {/* Show target groups and promotions if any */}
                          {(event.targetGroups && event.targetGroups.length > 0) ||
                          (event.targetPromotions && event.targetPromotions.length > 0) ? (
                            <div className="ml-2 flex flex-wrap gap-1">
                              {event.targetGroups && event.targetGroups.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e6f9f1] text-[#1e8e68]">
                                  Groups: {event.targetGroups.join(", ")}
                                </span>
                              )}
                              {event.targetPromotions && event.targetPromotions.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e6f9f1] text-[#1e8e68]">
                                  Promotions: {event.targetPromotions.join(", ")}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-[#3ddc97] hover:text-[#1e8e68] mr-3 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No events found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
