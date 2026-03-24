
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

export interface GoogleUserProfile {
    name: string;
    email: string;
    picture: string;
}

// FIX: Add Game and SportsData types for the SportsWidget component.
export interface Game {
  id: string;
  status: 'LIVE' | 'UPCOMING' | 'FINAL';
  details: string;
  awayTeam: {
    name: string;
    score: number | null;
  };
  homeTeam: {
    name: string;
    score: number | null;
  };
}

export type SportsData = Game[];
