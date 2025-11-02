
import React from 'react';

interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ title, children, className = '', icon }) => {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 sm:p-6 flex flex-col shadow-lg hover:border-slate-600 transition-colors duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-3">
          <span className="text-sky-400">{icon}</span>
          {title}
        </h2>
      </div>
      <div className="flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default WidgetCard;