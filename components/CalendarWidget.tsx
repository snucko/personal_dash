
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
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
        setError(err instanceof Error ? err.message : 'Failed to fetch calendar events.');
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
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-3xl text-white tracking-tight">{monthName}</h3>
                    <span className="text-2xl text-slate-500 font-light">{year}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-full border border-slate-700">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider">Today</button>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-grow">
                {/* Calendar Grid Section */}
                <div className="xl:col-span-7">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2 place-items-center">
                        {renderCalendarGrid()}
                    </div>
                </div>

                {/* Events List Section */}
                <div className="xl:col-span-5 flex flex-col border-t xl:border-t-0 xl:border-l border-slate-700 pt-6 xl:pt-0 xl:pl-8">
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">Schedule for</h4>
                        <p className="text-xl font-bold text-white">{selectedDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div 
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 text-slate-500 animate-pulse"
                                >
                                    <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                                    <p>Syncing events...</p>
                                </motion.div>
                            ) : error ? (
                                <motion.div 
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
                                >
                                    <p className="text-red-400 text-sm">{error}</p>
                                </motion.div>
                            ) : selectedDayEvents.length > 0 ? (
                                <motion.div 
                                    key="events"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-3"
                                >
                                    {selectedDayEvents.map((event, idx) => (
                                        <motion.div 
                                            key={event.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group relative pl-4 border-l-2 border-sky-500/30 hover:border-sky-500 transition-colors"
                                        >
                                            <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="block">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tighter mb-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {formatEventTime(event)}
                                                </div>
                                                <p className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">{event.summary}</p>
                                                {event.location && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {event.location}
                                                </p>}
                                            </a>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-32 text-slate-600 italic"
                                >
                                    <p>No events scheduled</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    </WidgetCard>
  );
};

export default CalendarWidget;