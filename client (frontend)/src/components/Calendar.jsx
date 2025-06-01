"use client"
import "./Calendar.css"
import { useState, useRef, useEffect, useCallback } from "react"
import { mockEvents } from "../mockData"

// Function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

// Function to get events for a specific date
const getEventsForDate = (dateString) => {
  return mockEvents[dateString] || []
}

const Calendar = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDateEvents, setSelectedDateEvents] = useState([])
  const lastCheckedDateRef = useRef(new Date().getDate())

  // Get month and year from current date
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Month names in French
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]

  // Days of the week in French (abbreviated)
  const daysOfWeek = ["L", "M", "M", "J", "V", "S", "D"]

  // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  // Adjust for Monday as first day of week (in France)
  const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Get number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Get number of days in previous month
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  // Calculate days from previous month to display
  const prevMonthDays = []
  for (let i = 0; i < firstDayIndex; i++) {
    prevMonthDays.unshift(daysInPrevMonth - i)
  }

  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Calculate how many days from next month to display
  const totalCells = 42 // 6 rows of 7 days (updated from 35)
  const nextMonthDaysCount = totalCells - (prevMonthDays.length + currentMonthDays.length)
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1)

  // Function to check if a date has events
  const hasEvents = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return false

    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return mockEvents[dateString] && mockEvents[dateString].length > 0
  }

  // Function to check if the day has changed
  const checkDayChange = () => {
    const now = new Date()
    const currentDay = now.getDate()

    // If the day has changed
    if (currentDay !== lastCheckedDateRef.current) {
      lastCheckedDateRef.current = currentDay

      // Update selected date to current date
      setSelectedDate(new Date(now))

      // If month has changed, update current month view
      if (now.getMonth() !== currentDate.getMonth() || now.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(new Date(now))
      }
    }
  }

  // Set up interval to check for day change
  useEffect(() => {
    // Check immediately on mount
    checkDayChange()

    // Check every minute (more frequent than needed, but ensures we don't miss the day change)
    const intervalId = setInterval(checkDayChange, 60000)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  // Memoize the onDateSelect function to prevent unnecessary re-renders
  const memoizedOnDateSelect = useCallback(onDateSelect, [])

  // Update events when selected date changes
  useEffect(() => {
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    const events = getEventsForDate(dateString)
    setSelectedDateEvents(events)

    if (memoizedOnDateSelect) {
      memoizedOnDateSelect(selectedDate, events)
    }
  }, [selectedDate, memoizedOnDateSelect])

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Handle date selection
  const handleDateClick = (day, isCurrentMonth) => {
    if (isCurrentMonth) {
      setSelectedDate(new Date(currentYear, currentMonth, day))
    } else {
      // If clicking on previous month day
      if (prevMonthDays.includes(day)) {
        const newDate = new Date(currentYear, currentMonth - 1, day)
        setCurrentDate(newDate)
        setSelectedDate(newDate)
      }
      // If clicking on next month day
      else {
        const newDate = new Date(currentYear, currentMonth + 1, day)
        setCurrentDate(newDate)
        setSelectedDate(newDate)
      }
    }
  }

  // Check if a date is selected
  const isDateSelected = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return false

    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    )
  }

  // Check if a date is today
  const isToday = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return false

    const today = new Date()
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
  }

  return (
    <div className="calendar-container">
      <div className="calendar-card">
        <div className="calendar-header">
          <h2 className="month-title">{monthNames[currentMonth]}</h2>
          <div className="nav-buttons">
            <button className="nav-button" onClick={goToPrevMonth}>
              &lt;
            </button>
            <button className="nav-button" onClick={goToNextMonth}>
              &gt;
            </button>
          </div>
        </div>

        <div className="weekdays-grid">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="dates-grid">
          {/* Previous month days */}
          {prevMonthDays.map((day) => (
            <button key={`prev-${day}`} className="date-button other-month" onClick={() => handleDateClick(day, false)}>
              {day.toString().padStart(2, "0")}
            </button>
          ))}

          {/* Current month days */}
          {currentMonthDays.map((day) => (
            <button
              key={`current-${day}`}
              className={`date-button ${
                isDateSelected(day, true) ? "selected-date" : "current-month"
              } ${isToday(day, true) ? "today" : ""} ${hasEvents(day, true) ? "has-event" : ""}`}
              onClick={() => handleDateClick(day, true)}
            >
              {isDateSelected(day, true) && <div className="date-circle"></div>}
              <span className="date-text">{day.toString().padStart(2, "0")}</span>
            </button>
          ))}

          {/* Next month days */}
          {nextMonthDays.map((day) => (
            <button key={`next-${day}`} className="date-button other-month" onClick={() => handleDateClick(day, false)}>
              {day.toString().padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Calendar
