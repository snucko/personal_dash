import type { Game, SportsData } from '../types';

interface ESPNTeam {
  id: string;
  displayName: string;
  abbreviation: string;
}

interface ESPNCompetitor {
  team: ESPNTeam;
  score: number;
}

interface ESPNEvent {
  id: string;
  name: string;
  date: string;
  status: {
    type: {
      name: string;
      state: string;
    };
    period?: number;
    displayClock?: string;
  };
  competitions: Array<{
    status: {
      type: {
        name: string;
        state: string;
      };
      period?: number;
      displayClock?: string;
    };
    competitors: ESPNCompetitor[];
  }>;
}

interface ESPNScheduleResponse {
  events: ESPNEvent[];
}

const BRUINS_ID = '1'; // Boston Bruins ESPN ID
const BRUINS_NAME = 'Boston Bruins';

const mapEventToGame = (event: ESPNEvent): Game => {
  const competition = event.competitions[0];
  const statusType = competition.status.type.name.toUpperCase();
  
  // Determine game status
  let status: 'LIVE' | 'UPCOMING' | 'FINAL';
  if (statusType.includes('IN PROGRESS') || statusType.includes('HALFTIME')) {
    status = 'LIVE';
  } else if (statusType.includes('SCHEDULED') || statusType.includes('UPCOMING')) {
    status = 'UPCOMING';
  } else {
    status = 'FINAL';
  }

  // Parse competitors - prefer Bruins as home, fallback to first team
  let homeTeam = competition.competitors.find(c => c.team.id === BRUINS_ID);
  let awayTeam: ESPNCompetitor;
  
  if (homeTeam) {
    // Bruins are home team
    awayTeam = competition.competitors.find(c => c.team.id !== BRUINS_ID) || competition.competitors[0];
  } else {
    // Bruins are away team
    awayTeam = competition.competitors.find(c => c.team.id === BRUINS_ID) || competition.competitors[0];
    homeTeam = competition.competitors.find(c => c.team.id !== awayTeam.team.id) || competition.competitors[1];
  }

  // Format details based on status
  let details = '';
  if (status === 'LIVE' && competition.status.displayClock) {
    details = `${competition.status.displayClock}`;
  } else if (status === 'UPCOMING') {
    const date = new Date(event.date);
    details = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else {
    details = 'Final';
  }

  return {
    id: event.id,
    status,
    details,
    awayTeam: {
      name: awayTeam.team.displayName.split(' ').pop() || awayTeam.team.displayName,
      score: awayTeam.score ?? null
    },
    homeTeam: {
      name: homeTeam.team.displayName.split(' ').pop() || homeTeam.team.displayName,
      score: homeTeam.score ?? null
    }
  };
};

export const getBruinsSchedule = async (limit: number = 5): Promise<SportsData> => {
  try {
    // Fetch scoreboard and filter for Bruins
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard`
    );

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data: ESPNScheduleResponse = await response.json();
    
    // Filter for Bruins games
    const bruinsGames = data.events
      .filter(event => 
        event.competitions[0]?.competitors?.some(c => c.team.id === BRUINS_ID)
      )
      .slice(0, limit)
      .map(mapEventToGame);

    if (bruinsGames.length === 0) {
      console.warn('No Bruins games found in scoreboard');
    }

    return bruinsGames;
  } catch (error) {
    console.error('Failed to fetch Bruins schedule:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch sports data'
    );
  }
};

export const getNHLScores = async (): Promise<SportsData> => {
  try {
    // Fallback to general NHL schedule if Bruins specific fails
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard'
    );

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data: ESPNScheduleResponse = await response.json();
    
    // Filter for Bruins games
    const bruinsGames = data.events
      .filter(event => 
        event.competitions[0]?.competitors?.some(c => c.team.id === BRUINS_ID)
      )
      .slice(0, 3)
      .map(mapEventToGame);

    return bruinsGames;
  } catch (error) {
    console.error('Failed to fetch NHL scores:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch sports data'
    );
  }
};
