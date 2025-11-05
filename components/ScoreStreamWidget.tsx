import React, { useEffect, useRef } from 'react';
import WidgetCard from './WidgetCard';
import { ICONS } from '../constants';

// Add TypeScript declaration for the ScoreStream global object.
declare global {
  interface Window {
    // Using `any` because the script might not always exist, and we will be deleting it.
    scorestream_jscdn?: any;
  }
}

const ScoreStreamWidget: React.FC = () => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect handles the full lifecycle of the third-party script.
    // It creates the script on mount and performs an aggressive cleanup on unmount
    // to ensure it works correctly with React's lifecycle (especially in Strict Mode).
    const scriptId = 'scorestream-sdk';
    const scriptSrc = 'https://scorestream.com/apiJsCdn/widgets/embed.js';

    // We create a new script tag every time the component mounts to ensure a clean load.
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = scriptSrc;
    script.async = true;
    script.type = 'text/javascript';

    // The script is expected to find the widget container and initialize itself automatically on load.
    document.body.appendChild(script);

    // This cleanup function is the key to fixing the issue. It runs when the component unmounts.
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        // 1. Remove the script tag from the document.
        document.body.removeChild(existingScript);
      }
      
      // 2. Delete the global object created by the script. This is crucial because
      // it resets the state, preventing errors when the script is reloaded on the next mount.
      if (window.scorestream_jscdn) {
        delete window.scorestream_jscdn;
      }

      // 3. Clear out the rendered widget content to prevent React from trying to manage it.
      if (widgetRef.current) {
        widgetRef.current.innerHTML = '';
      }
    };
  }, []); // The empty dependency array ensures this runs only once on mount and cleanup on unmount.


  return (
    <WidgetCard title="NFL Scores" icon={ICONS.nfl}>
      {/* This container ensures the widget has space to render and shows a loading state. */}
      <div className="flex flex-col justify-center w-full h-full min-h-[150px]">
        <div 
          ref={widgetRef} // A ref to help with cleanup.
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
