
import React, { useState, useEffect } from 'react';
import ClockWidget from './components/ClockWidget';
import WeatherWidget from './components/WeatherWidget';
import CalendarWidget from './components/CalendarWidget';
import TodoWidget from './components/TodoWidget';
import SportsWidget from './components/SportsWidget';
import ScoreStreamWidget from './components/ScoreStreamWidget';
import { ICONS } from './constants';

// FIX: Define/augment the AIStudio interface and use it for window.aistudio to resolve type conflicts.
// The original inline type for window.aistudio was conflicting with an existing global definition.
// This also adds the `auth` property to the AIStudio type, fixing subsequent property access errors.
declare global {
    interface AIStudio {
        auth: {
            getOAuthToken: (options: {scopes: string[]}) => Promise<string>;
        }
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthAvailable, setIsAuthAvailable] = useState(false);

  useEffect(() => {
    // Check if the authentication function is available on the window object when the component mounts.
    // This prevents showing a button that will always fail if the environment doesn't support it.
    if (typeof window.aistudio?.auth?.getOAuthToken === 'function') {
      setIsAuthAvailable(true);
    }
  }, []);

  const handleConnectGoogle = async () => {
    if (!isAuthAvailable || !window.aistudio?.auth) {
        const errorMsg = "Authentication functionality is not available in this environment.";
        setAuthError(errorMsg);
        console.error(errorMsg);
        return;
    }
    
    setIsConnecting(true);
    setAuthError(null);
    try {
        const token = await window.aistudio.auth.getOAuthToken({
            scopes: [
                'https://www.googleapis.com/auth/calendar.events.readonly',
                'https://www.googleapis.com/auth/tasks'
            ]
        });
        setAccessToken(token);
    } catch (error) {
        console.error("Google authentication failed:", error);
        setAuthError("Failed to connect Google Account. Please try again.");
    } finally {
        setIsConnecting(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div 
        className="fixed inset-0 z-[-1] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/50"
      ></div>

      <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-4xl md:text-5xl font-bold text-sky-300 tracking-tight">Personal Dashboard</h1>
            <p className="text-slate-400 mt-1">Your personal overview at a glance.</p>
        </div>
        {isAuthAvailable && !accessToken && (
            <div className="flex flex-col items-end">
                <button
                    onClick={handleConnectGoogle}
                    disabled={isConnecting}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-wait text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    {ICONS.google}
                    {isConnecting ? 'Connecting...' : 'Connect Google Account'}
                </button>
                {authError && <p className="text-red-400 text-sm mt-1">{authError}</p>}
            </div>
        )}
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClockWidget />
        <WeatherWidget />
        <ScoreStreamWidget />
        <SportsWidget team="Boston Bruins" league="NHL" icon={ICONS.bruins} />
        <div className="sm:col-span-2 lg:col-span-4 xl:col-span-2">
            <CalendarWidget accessToken={accessToken} />
        </div>
        <div className="sm:col-span-2 lg:col-span-4 xl:col-span-2">
           <TodoWidget accessToken={accessToken} />
        </div>
      </main>
    </div>
  );
};

export default App;
