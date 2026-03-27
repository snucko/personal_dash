import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ClockWidget from './components/ClockWidget';
import WeatherWidget from './components/WeatherWidget';
import CalendarWidget from './components/CalendarWidget';
import TodoWidget from './components/TodoWidget';
import SportsWidget from './components/SportsWidget';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ICONS } from './constants';
import { useAuth } from './contexts/AuthContext';

// Add type definitions for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: GSIConfig) => GSITokenClient;
          hasGrantedAllScopes: (token: any, scope: string) => boolean;
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

interface GSIConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
}

interface GSITokenClient {
  requestAccessToken: () => void;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

const SetupGuide: React.FC = () => (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-95 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-3xl w-full bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-2xl text-slate-200 my-8">
            <h2 className="text-3xl font-bold text-sky-300 mb-4">Configuration Required</h2>
            
            <div className="bg-red-900/20 border border-red-500/50 p-5 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">🛑</div>
                    <div>
                        <h3 className="text-red-400 font-bold text-lg mb-1">Fix for "Error 400: redirect_uri_mismatch"</h3>
                        <p className="text-slate-300 text-sm mb-2">
                            This error means Google doesn't recognize your current URL. You must create a <strong>Web application</strong> Client ID and add your URL to the "Authorized JavaScript origins" list.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 text-slate-300">
                <p>Please follow these steps exactly to create your Google credentials:</p>
                
                <ol className="list-decimal list-inside space-y-4">
                    <li className="bg-slate-700/30 p-4 rounded border border-slate-600">
                        <strong>Step 1: Configure OAuth Consent Screen</strong>
                        <p className="text-sm text-slate-400 mt-2 mb-2">Google requires this before you can create a Client ID.</p>
                        <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                            <li>Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">OAuth consent screen</a>.</li>
                            <li>Select <strong>External</strong> and click <strong>Create</strong>.</li>
                            <li>Fill in <strong>App name</strong> (e.g., "My Dashboard"), <strong>Support email</strong>, and <strong>Developer contact info</strong>.</li>
                            <li>Click <strong>SAVE AND CONTINUE</strong> through the remaining sections.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Step 2: Create OAuth Client ID</strong>
                        <ul className="list-disc list-inside space-y-1 text-sm pl-4 mt-2">
                            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Credentials</a>.</li>
                            <li>Click <strong>+ CREATE CREDENTIALS</strong> &gt; <strong>OAuth client ID</strong>.</li>
                            <li>Select <strong>Web application</strong> as the Application type.</li>
                        </ul>
                    </li>
                    <li className="bg-slate-700/50 p-4 rounded border border-sky-500/30">
                        <strong>Step 3: Add Authorized JavaScript Origin</strong>
                        <p className="text-sm text-slate-400 mt-2">Under <strong>Authorized JavaScript origins</strong>, click <strong>ADD URI</strong> and paste:</p>
                        <div className="mt-2 p-3 bg-slate-950 font-mono text-yellow-300 rounded border border-slate-600 select-all flex justify-between items-center">
                            <span>{window.location.origin}</span>
                            <button 
                                onClick={() => navigator.clipboard.writeText(window.location.origin)}
                                className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-400"
                            >
                                Copy
                            </button>
                        </div>
                    </li>
                    <li>
                        <strong>Step 4: Update App.tsx</strong>
                        <p className="text-sm text-slate-400 mt-2">Copy the <strong>Client ID</strong> and paste it into <code>App.tsx</code> (line 14).</p>
                    </li>
                    <li className="bg-amber-900/20 p-4 rounded border border-amber-500/30">
                        <strong>Step 5: Enable APIs (CRITICAL)</strong>
                        <p className="text-sm text-slate-300 mt-2 mb-2">You must enable these APIs in your Google Cloud project or the widgets will fail:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                            <li>Go to <a href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Google Calendar API</a> and click <strong>ENABLE</strong>.</li>
                            <li>Go to <a href="https://console.cloud.google.com/apis/library/tasks.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Google Tasks API</a> and click <strong>ENABLE</strong>.</li>
                        </ul>
                    </li>
                </ol>
            </div>
        </div>
    </div>
);

const ConsentScreenGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-slate-900 bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-2xl text-slate-200 relative" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors">
        {ICONS.close}
      </button>
      <h2 className="text-2xl font-bold text-sky-300 mb-4">Customize Login Screen Name</h2>
      <div className="space-y-3 text-slate-300">
        <p>If the Google login prompt shows a generic name like "Desktop App," you can easily change it by editing your project's OAuth Consent Screen.</p>
        <ol className="list-decimal list-inside space-y-2 mt-2 pl-2">
            <li>Go to the <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-semibold">OAuth consent screen</a> page in the Google Cloud Console.</li>
            <li>Click <strong>EDIT APP</strong>.</li>
            <li>Change the <strong>App name</strong> to "Personal Dashboard" or your preferred name.</li>
            <li>Scroll down and click <strong>SAVE AND CONTINUE</strong> to apply the change.</li>
        </ol>
        <p className="text-sm text-slate-400 pt-2">This change is cosmetic and only affects what you see during login. It does not affect functionality.</p>
      </div>
    </div>
  </div>
);


const App: React.FC = () => {
  const { accessToken, userProfile, isConnecting, authError, handleConnectGoogle, handleDisconnect } = useAuth();
  const [showNameFixGuide, setShowNameFixGuide] = useState(false);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isConfigured = GOOGLE_CLIENT_ID !== '' && GOOGLE_CLIENT_ID !== 'YOUR_LOCAL_CLIENT_ID_HERE';

  if (!isConfigured) {
      return <SetupGuide />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div 
        className="fixed inset-0 z-[-1] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/50"
      ></div>

      <AnimatePresence>
        {showNameFixGuide && <ConsentScreenGuideModal onClose={() => setShowNameFixGuide(false)} />}
      </AnimatePresence>

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap justify-between items-center gap-4"
      >
        <div>
            <h1 className="text-4xl md:text-5xl font-bold text-sky-300 tracking-tight">Personal Dashboard</h1>
            <p className="text-slate-400 mt-1 font-medium">Your personal overview at a glance.</p>
        </div>
        {!accessToken && (
            <div className="flex flex-col items-end">
                <button
                    onClick={handleConnectGoogle}
                    disabled={isConnecting}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-wait text-white font-semibold py-2 px-4 rounded-lg transition-all active:scale-95"
                >
                    {ICONS.google}
                    {isConnecting ? 'Connecting...' : 'Connect Google Account'}
                </button>
                {authError && authError.type === 'generic' && <p className="text-red-400 text-sm mt-1 max-w-xs text-right">{authError.message}</p>}
            </div>
        )}
        {accessToken && userProfile && (
            <div className="flex items-center gap-4">
                 <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                        <p className="font-semibold text-slate-200">{userProfile.name}</p>
                        <button
                            onClick={() => setShowNameFixGuide(true)}
                            aria-label="Information about the login screen name"
                            title="Information about the login screen name"
                            className="text-slate-500 hover:text-sky-300 transition-colors"
                        >
                            {ICONS.info}
                        </button>
                    </div>
                    <p className="text-sm text-slate-400">{userProfile.email}</p>
                </div>
                <img src={userProfile.picture} alt="User profile" className="w-12 h-12 rounded-full border-2 border-slate-600" />
                <button 
                    onClick={handleDisconnect} 
                    className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                >
                    Disconnect
                </button>
            </div>
        )}
      </motion.header>

      {authError && authError.type === 'config' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm max-w-4xl mx-auto"
        >
            <h3 className="font-bold text-lg text-red-300 mb-2">Configuration Error</h3>
            <p className="mb-2">Google rejected the request. This usually happens for one of two reasons:</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
                <li><strong>Wrong ID Type:</strong> You might be using a Desktop Client ID. You MUST use a <strong>Web application</strong> Client ID.</li>
                <li><strong>Origin Mismatch:</strong> The URL in your browser ({window.location.origin}) is not listed in the "Authorized JavaScript origins" of your Client ID.</li>
            </ul>
            <p>Please check your Google Cloud Console settings.</p>
        </motion.div>
      )}

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Sidebar: Quick Info & Sports */}
         <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1">
           <div className="sticky top-8 space-y-6">
             <ErrorBoundary>
               <ClockWidget />
             </ErrorBoundary>
             <ErrorBoundary>
               <WeatherWidget />
             </ErrorBoundary>
             <div className="hidden lg:block">
               <ErrorBoundary>
                 <SportsWidget team="Boston Bruins" league="NHL" icon={ICONS.bruins} />
               </ErrorBoundary>
             </div>
           </div>
         </aside>

         {/* Main Content: Calendar and Tasks */}
         <section className="lg:col-span-9 space-y-8 order-1 lg:order-2">
           <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
             {/* Calendar takes more space */}
             <div className="xl:col-span-3 h-full min-h-[600px] flex flex-col">
               <ErrorBoundary>
                 <CalendarWidget accessToken={accessToken} />
               </ErrorBoundary>
             </div>
             
             {/* Tasks takes the rest */}
             <div className="xl:col-span-2 h-full min-h-[600px] flex flex-col">
               <ErrorBoundary>
                 <TodoWidget />
               </ErrorBoundary>
             </div>
           </div>
           
           {/* Mobile scores */}
           <div className="lg:hidden">
             <ErrorBoundary>
               <SportsWidget team="Boston Bruins" league="NHL" icon={ICONS.bruins} />
             </ErrorBoundary>
           </div>
         </section>
      </motion.main>
    </div>
  );
};

export default App;