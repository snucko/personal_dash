
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

export interface Game {
  id: string;
  homeTeam: { name: string; score: string; };
  awayTeam: { name: string; score: string; };
  status: 'LIVE' | 'UPCOMING' | 'FINAL' | 'INFO';
  details: string; // e.g., "Q2 05:30", "Sun 1:00 PM", "Final"
}

export type SportsData = Game[];

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
