"use client"

import "./Accueil.css"
import Calendar from "./Calendar"
import Publication from "./Publication"
import EventsList from "./EventsList"
import { useState } from "react"

const Accueil = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDateEvents, setSelectedDateEvents] = useState([])

  const handleDateSelect = (date, events) => {
    setSelectedDate(date)
    setSelectedDateEvents(events)
  }

  return (
    <div className="App">
      <div className="container">
        <div className="main">
          <div className="publication">
            <Publication />
          </div>
          <div className="programme">
            <div className="calendrier">
              <Calendar onDateSelect={handleDateSelect} />
            </div>
            <div className="planning">
              <EventsList selectedDate={selectedDate} selectedDateEvents={selectedDateEvents} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Accueil
