
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  location: string;
}

export interface SportsData {
  status: 'LIVE' | 'UPCOMING' | 'INFO';
  headline: string;
  details: string;
}

export interface GoogleCalendarEvent {
    id: string;
    summary: string;
    start: { date?: string; dateTime?: string };
    end: { date?: string; dateTime?: string };
    htmlLink: string;
}

export interface GoogleTask {
    id: string;
    title: string;
    status: 'needsAction' | 'completed';
    notes?: string;
    due?: string;
}