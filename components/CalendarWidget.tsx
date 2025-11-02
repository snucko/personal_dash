
import React, { useState, useEffect, useMemo } from 'react';
import WidgetCard from './WidgetCard';
import { ICONS } from '../constants';
import { getCalendarEvents } from '../services/googleApiService';
import type { GoogleCalendarEvent } from '../types';

interface CalendarWidgetProps {
    accessToken: string | null;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ accessToken }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!accessToken) return;

      setLoading(true);
      setError(null);
      try {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const data = await getCalendarEvents(accessToken, firstDay.toISOString(), lastDay.toISOString());
        setEvents(data);
      } catch (err) {
        setError('Failed to fetch calendar events.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [accessToken, currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const today = new Date();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, GoogleCalendarEvent[]>();
    events.forEach(event => {
        const eventDateStr = event.start.dateTime || event.start.date;
        if (eventDateStr) {
            const eventDate = new Date(eventDateStr);
            if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
                const day = eventDate.getDate();
                if (!map.has(day)) {
                    map.set(day, []);
                }
                map.get(day)?.push(event);
            }
        }
    });
    return map;
  }, [events, month, year]);

  const selectedDayEvents = useMemo(() => {
    return eventsByDay.get(selectedDate.getDate())?.filter(
        e => new Date(e.start.dateTime || e.start.date as string).toDateString() === selectedDate.toDateString()
    ) || [];
  }, [eventsByDay, selectedDate]);


  const renderCalendarGrid = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = today.getFullYear() === year && today.getMonth() === month && day === today.getDate();
        const isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && day === selectedDate.getDate();
        const hasEvents = eventsByDay.has(day);

        days.push(
          <button
            key={day}
            onClick={() => setSelectedDate(new Date(year, month, day))}
            className={`relative w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors
              ${isSelected ? 'bg-sky-500 text-white font-bold' : ''}
              ${!isSelected && isToday ? 'border-2 border-sky-400 text-sky-300' : ''}
              ${!isSelected ? 'text-slate-300 hover:bg-slate-700' : ''}
            `}
          >
            {day}
            {hasEvents && <span className="absolute bottom-1 h-1.5 w-1.5 bg-green-400 rounded-full"></span>}
          </button>
        );
    }
    return days;
  }

  const formatEventTime = (event: GoogleCalendarEvent) => {
    if (event.start.dateTime) {
        return new Date(event.start.dateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return 'All day';
  };


  if (!accessToken) {
    return (
        <WidgetCard title="Calendar" icon={ICONS.calendar} className="h-full">
            <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-400">
                <p>Connect your Google Account to see your calendar.</p>
            </div>
        </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Calendar" icon={ICONS.calendar} className="h-full">
        <div className="flex flex-col md:flex-row h-full gap-4">
            <div className="flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors">&lt;</button>
                <h3 className="font-semibold text-lg text-white">{monthName} {year}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-slate-400 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-2 place-items-center">
                {renderCalendarGrid()}
                </div>
            </div>
            <div className="flex-grow border-t md:border-t-0 md:border-l border-slate-700 mt-4 md:mt-0 pt-4 md:pt-0 md:pl-4">
                <h4 className="font-bold text-white mb-2">{selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                {loading ? (
                    <p className="text-slate-400">Loading events...</p>
                ) : error ? (
                    <p className="text-red-400">{error}</p>
                ) : selectedDayEvents.length > 0 ? (
                    <ul className="space-y-2 overflow-y-auto max-h-48 pr-2">
                        {selectedDayEvents.map(event => (
                            <li key={event.id} className="text-sm bg-slate-700/50 p-2 rounded-md">
                                <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="hover:text-sky-300">
                                    <p className="font-semibold text-slate-200">{event.summary}</p>
                                    <p className="text-slate-400">{formatEventTime(event)}</p>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-400">No events for this day.</p>
                )}
            </div>
        </div>
    </WidgetCard>
  );
};

export default CalendarWidget;