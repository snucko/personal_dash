
import React, { useState, useEffect } from 'react';
import type { SportsData } from '../types';
import { getSportsData } from '../services/geminiService';
import WidgetCard from './WidgetCard';

interface SportsWidgetProps {
  team: string;
  league: string;
  icon: React.ReactNode;
}

const SportsWidget: React.FC<SportsWidgetProps> = ({ team, league, icon }) => {
  const [data, setData] = useState<SportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        const result = await getSportsData(team);
        setData(result);
      } catch (err) {
        setError(`Could not fetch ${league} data.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, league]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-700 rounded-md w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded-md"></div>
          <div className="h-4 bg-slate-700 rounded-md w-5/6"></div>
        </div>
      );
    }

    if (error) {
      return <p className="text-red-400">{error}</p>;
    }

    if (data) {
      switch (data.status) {
        case 'LIVE':
          return (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-red-400 font-semibold text-xs uppercase tracking-wider">LIVE</span>
              </div>
              <h4 className="font-bold text-lg text-white">{data.headline}</h4>
              <p className="text-2xl font-bold text-sky-300 mt-1">{data.details}</p>
            </div>
          );
        case 'UPCOMING':
          return (
            <div>
               <h4 className="font-semibold text-md text-slate-300">{data.headline}</h4>
               <p className="text-lg text-white mt-1">{data.details}</p>
            </div>
          );
        case 'INFO':
        default:
          return (
            <div>
              <h4 className="font-bold text-md text-sky-300">{data.headline}</h4>
              <p className="text-sm text-slate-400 mt-1">{data.details}</p>
            </div>
          );
      }
    }

    return null;
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