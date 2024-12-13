'use client'

import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

type Match = {
  id: string
  title: string
  start: Date
  end: Date
  color?: string
}

type MatchCalendarProps = {
  initialMatches: Match[]
}

type ViewType = View

export default function MatchCalendar({ initialMatches }: MatchCalendarProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches.map(match => ({
    ...match,
    start: new Date(match.start),
    end: new Date(match.end)
  })))
  const [view, setView] = useState<ViewType>('month')

  const viewOptions: ViewType[] = ['month', 'week', 'day', 'agenda']

  const eventStyleGetter = (event: Match) => {
    return {
      style: {
        backgroundColor: event.color || '#3788d8',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    }
  }

  const memoizedLocalizer = useMemo(() => localizer, [])

  const formats = {
    timeGutterFormat: (date: Date, culture?: string) =>
      localizer.format(date, 'HH:mm', culture || 'en-US'),
    eventTimeRangeFormat: ({ start, end }: { start: Date, end: Date }, culture?: string) =>
      `${localizer.format(start, 'HH:mm', culture || 'en-US')} - ${localizer.format(end, 'HH:mm', culture || 'en-US')}`,
  }

  const handleSelectEvent = (event: Match) => {
    console.log('Event selected:', event)
    // Add your logic for handling event selection here
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="default" 
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          + Add New Schedule
        </Button>
        <div className="flex gap-2">
          {viewOptions.map((viewOption) => (
            <Button
              key={viewOption}
              variant="outline"
              className={cn(
                "capitalize",
                view === viewOption && "bg-blue-500 text-white hover:bg-blue-600"
              )}
              onClick={() => setView(viewOption)}
            >
              {viewOption}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-[700px]">
        <Calendar
          localizer={memoizedLocalizer}
          events={matches}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={(newView: ViewType) => setView(newView)}
          eventPropGetter={eventStyleGetter}
          className="rounded-lg"
          defaultView="month"
          timeslots={1}
          step={60}
          formats={formats}
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  )
}

