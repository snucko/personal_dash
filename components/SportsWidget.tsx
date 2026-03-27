import React, { useState, useEffect } from 'react';
import type { SportsData, Game } from '../types';
import WidgetCard from './WidgetCard';
import { getBruinsSchedule } from '../services/sportsService';

interface SportsWidgetProps {
  team: string;
  league: string;
  icon: React.ReactNode;
}

const LiveIndicator: React.FC = () => (
  <div className="flex items-center gap-1.5">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
    </span>
    <span className="text-red-400 font-semibold text-xs uppercase tracking-wider">LIVE</span>
  </div>
);

const GameRow: React.FC<{ game: Game }> = ({ game }) => {
  const isLive = game.status === 'LIVE';
  const isUpcoming = game.status === 'UPCOMING';
  
  return (
    <div className="text-sm">
        <div className="flex justify-between items-center">
            <div className="flex flex-col">
                <div className="flex items-center">
                    <span className="w-20 truncate">{game.awayTeam.name}</span>
                    <span className="font-bold text-slate-200 ml-2">{game.awayTeam.score ?? '-'}</span>
                </div>
                <div className="flex items-center mt-1">
                    <span className="w-20 truncate">{game.homeTeam.name}</span>
                    <span className="font-bold text-slate-200 ml-2">{game.homeTeam.score ?? '-'}</span>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
                {isLive ? <LiveIndicator /> : null}
                <p className={`text-xs mt-1 ${isLive ? 'text-slate-300' : 'text-slate-400'}`}>{game.details}</p>
            </div>
        </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-24"></div>
          <div className="h-4 bg-slate-700 rounded w-20"></div>
        </div>
        <div className="h-4 bg-slate-700 rounded w-16"></div>
      </div>
    ))}
  </div>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="text-center">
    <p className="text-sm text-red-400 mb-3">Failed to load scores</p>
    <button
      onClick={onRetry}
      className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors"
    >
      Retry
    </button>
  </div>
);

const SportsWidget: React.FC<SportsWidgetProps> = ({ team, league, icon }) => {
  const [data, setData] = useState<SportsData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const scores = await getBruinsSchedule(3);
      setData(scores);
    } catch (err) {
      console.error('Sports fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scores');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScores();
    // Refresh scores every 5 minutes during season
    const interval = setInterval(loadScores, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return <ErrorState onRetry={loadScores} />;
    }

    if (data.length > 0) {
      return (
        <div className="space-y-3">
          {data.map((game) => (
            <GameRow key={game.id} game={game} />
          ))}
        </div>
      );
    }

    return <p className="text-slate-400 text-center text-sm">No games found</p>;
  };

  return (
    <WidgetCard title={league} icon={icon}>
      <div className="flex-grow flex flex-col justify-center">
        {renderContent()}
      </div>
    </WidgetCard>
  );
};

export default SportsWidget;