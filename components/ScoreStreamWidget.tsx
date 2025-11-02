import React, { useEffect } from 'react';
import WidgetCard from './WidgetCard';
import { ICONS } from '../constants';

// Add TypeScript declaration for the ScoreStream global object.
// This allows us to safely access window.scorestream_jscdn without type errors.
declare global {
  interface Window {
    scorestream_jscdn?: {
      initWidgets: () => void;
    };
  }
}

const ScoreStreamWidget: React.FC = () => {
  useEffect(() => {
    const scriptId = 'scorestream-sdk';
    const scriptSrc = 'https://scorestream.com/apiJsCdn/widgets/embed.js';

    const initializeWidget = () => {
      if (window.scorestream_jscdn?.initWidgets) {
        window.scorestream_jscdn.initWidgets();
      }
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (script) {
      // If script tag exists, check if the script has loaded by looking for its global.
      if (window.scorestream_jscdn) {
        initializeWidget();
      } else {
        // Script tag exists but script hasn't executed yet. Add a listener.
        script.addEventListener('load', initializeWidget);
      }
    } else {
      // Script tag doesn't exist, so create it and add it to the page.
      script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptSrc;
      script.async = true;
      script.type = 'text/javascript';
      // Add listener to initialize widget once script is loaded.
      script.addEventListener('load', initializeWidget);
      document.body.appendChild(script);
    }

    // Cleanup function to remove the event listener when the component unmounts.
    // This is crucial for preventing memory leaks and issues in React's Strict Mode.
    return () => {
      const scriptTag = document.getElementById(scriptId);
      if (scriptTag) {
        scriptTag.removeEventListener('load', initializeWidget);
      }
    };
  }, []);


  return (
    <WidgetCard title="NFL Scores" icon={ICONS.nfl}>
      {/* This container ensures the widget has space to render and shows a loading state. */}
      <div className="flex flex-col justify-center w-full h-full min-h-[150px]">
        <div 
          className="scorestream-widget-container" 
          data-ss_widget_type="horzScoreboard" 
          data-user-widget-id="67179"
        >
          {/* This content will be replaced by the ScoreStream script and acts as a loading indicator. */}
          <div className="text-slate-400 text-center p-4">Loading NFL scores...</div>
        </div>
        <div className="text-xs text-slate-500 text-right mt-auto pt-2">
          Scores provided by <a href="https://scorestream.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-400 transition-colors">ScoreStream.com</a>
        </div>
      </div>
    </WidgetCard>
  );
};

export default ScoreStreamWidget;
