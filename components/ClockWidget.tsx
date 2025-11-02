
import React from 'react';
import { useCurrentTime } from '../hooks/useCurrentTime';
import WidgetCard from './WidgetCard';
import { ICONS } from '../constants';

const ClockWidget: React.FC = () => {
  const currentTime = useCurrentTime();

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const secondsString = currentTime.toLocaleTimeString([], { second: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const ampmString = currentTime.getHours() >= 12 ? 'PM' : 'AM';


  return (
    <WidgetCard title="Current Time" icon={ICONS.clock}>
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline">
            <p className="text-5xl md:text-6xl font-bold text-white tracking-tighter">
            {timeString}
            </p>
            <p className="text-xl font-semibold text-slate-400 ml-2">{ampmString}</p>
        </div>
        <p className="text-base text-slate-400">{dateString}</p>
      </div>
    </WidgetCard>
  );
};

export default ClockWidget;