"use client"

import { useState, useEffect } from "react"
import "./EventsList.css"

// Static events data
const staticEvents = {
  "2025-06-01": [
    {
      id: 4,
      title: "Présentation Projet Pluridisciplinaire",
      time: "08:30",
      type: "exam"
    }
  ],
  "2025-06-04": [
    {
      id: 5,
      title: "Examen Remplacement ProbaStat 2",
      time: "13:00",
      type: "exam"
    }
  ],
  "2025-06-05": [
    {
      id: 6,
      title: "Consultation POO",
      time: "09:00",
      type: "exam"
    }
  ],
  "2025-05-17": [
    {
      id: 1,
      title: "Dernier délai de la soumise du rapport finale",
      time: "23:59",
      type: "deadline" // Add this type for styling
    }
  ],
  "2025-05-09": [
    {
      id: 2,
      title: "Examen Module Architecture",
      time: "09:00",
      type: "exam"
    },
    {
      id: 3,
      title: "TD Programmation Web",
      time: "14:00",
      type: "td"
    }
  ]
}

// Function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

// Function to get events for a specific date
const getEventsForDate = (dateString) => {
  return staticEvents[dateString] || []
}

// Function to get today's events (if no events for today, return tomorrow's events)
const getTodayEvents = () => {
  const may17Events = staticEvents["2025-05-17"]
  if (may17Events && may17Events.length > 0) {
    return may17Events
  }

  const todayEvents = getEventsForDate(getTodayDateString())
  if (todayEvents.length > 0) {
    return todayEvents
  }

  // If no events today, return events from the next available date
  const allDates = Object.keys(staticEvents).sort()
  const futureDates = allDates.filter((date) => date >= getTodayDateString())

  if (futureDates.length > 0) {
    return staticEvents[futureDates[0]]
  }

  return []
}

const EventsList = ({ selectedDate }) => {
  const [events, setEvents] = useState([])
  const [dateString, setDateString] = useState("")

  useEffect(() => {
    const date = selectedDate || new Date()
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    setDateString(formattedDate)

    // For demo purposes, if no date is selected, show May 9, 2025 events
    if (!selectedDate) {
      setEvents(staticEvents["2025-05-09"] || getTodayEvents())
      return
    }

    // If we have events for the selected date, show them
    const dateEvents = getEventsForDate(formattedDate)
    if (dateEvents.length > 0) {
      setEvents(dateEvents)
    } else {
      // If a date is selected but no events, show empty
      setEvents([])
    }
  }, [selectedDate])

  // Format date for display
  const formatDisplayDate = (date) => {
    if (!selectedDate) {
      return "9 mai 2025" // For demo purposes
    }
    const options = { weekday: "long", day: "numeric", month: "long" }
    return date.toLocaleDateString("fr-FR", options)
  }

  // Get class based on event type
  const getEventClass = (type) => {
    return `event-${type}`
  }

  return (
    <div className="events-list-container">
      <div className="events-list-header">
        <h3>Événements du jour</h3>
        <span className="events-date">{formatDisplayDate(selectedDate || new Date())}</span>
      </div>

      <div className="events-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className={`event-item ${getEventClass(event.type)}`}>
              <div className="event-details">
                <div className="event-title">{event.title}</div>
                <div className="event-time">{event.time}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-events">
            <p>Pas d'événements aujourd'hui</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsList
