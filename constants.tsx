
import React from 'react';

// FIX: Add `as const` to the `iconProps` object to ensure TypeScript infers specific literal types for properties like `strokeLinecap`. This fixes type errors where a generic `string` was incompatible with React's specific SVG prop types.
const iconProps = {
    className: "w-6 h-6",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
} as const;

export const ICONS = {
    clock: <svg {...iconProps}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    calendar: <svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    todo: <svg {...iconProps}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    nfl: <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.181 2.373L7.29 11.012h3.706v6.615H7.29L12.181 21.6l4.891-8.973H13.37v-6.615h3.706L12.181 2.373z M12 0l7.587 13.026H15.42v7.711L12 24l-7.587-13.026h4.167V3.263L12 0z"/></svg>,
    bruins: <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.59L7.41 14 6 15.41l5 5 8-8L17.59 11 11 17.59zM16.59 7L11 12.59 7.41 9 6 10.41l5 5 7-7L16.59 7z" transform="scale(1.2) translate(-2, -2)"/></svg>,
    weather: <svg {...iconProps}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>,
    sun: <svg {...iconProps} className="w-12 h-12 text-yellow-400"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
    cloud: <svg {...iconProps} className="w-12 h-12 text-slate-400"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>,
    rain: <svg {...iconProps} className="w-12 h-12 text-blue-400"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><path d="M16 14v2m-8-2v2m4-2v2"></path></svg>,
    snow: <svg {...iconProps} className="w-12 h-12 text-white"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><path d="M16 14v2m-8-2v2m4-2v2m-2 2l-1-1-1 1m6 0l-1-1-1 1"></path></svg>,
    storm: <svg {...iconProps} className="w-12 h-12 text-yellow-500"><path d="M21 16.92V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.08A5.99 5.99 0 0 1 6 7.17V7a6 6 0 0 1 12 0v.17A5.99 5.99 0 0 1 21 14.92z"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>,
    google: <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.865,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>,
};