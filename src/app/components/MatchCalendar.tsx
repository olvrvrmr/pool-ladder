'use client'

import { useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

type Match = {
  id: string
  title: string
  start: Date
  end: Date
}

type MatchCalendarProps = {
  initialMatches: Match[]
}

export default function MatchCalendar({ initialMatches }: MatchCalendarProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={matches}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </div>
  )
}

