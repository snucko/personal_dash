# Personal Dashboard - Deployment & Architecture Guide

## Overview

Personal Dashboard is a React + Vite application integrated with Google Calendar and Tasks APIs, deployed on Cloudflare Pages with OAuth 2.0 authentication.

## What We Improved

### 1. Code Quality & Architecture

**AuthContext (State Management)**
- Centralized all authentication logic to eliminate prop drilling
- Moved OAuth initialization into context provider
- Proper error handling and state management for Google Identity Services
- Token lifecycle management

**Error Boundaries**
- Added error boundary components to gracefully handle widget failures
- Individual widgets won't crash the entire app
- User-friendly error messages

**Environment Variables**
- Moved hardcoded Client ID to environment variables
- Secure configuration for different environments (local/prod)
- `.env.local` ignored in git

**API Service Improvements**
- Added abort controllers to cancel in-flight requests
- Proper cleanup on component unmount
- Debounced fetch operations

**Type Safety**
- Proper TypeScript types for Google Identity Services
- Interfaces for Google OAuth config and token responses

### 2. Session Persistence

- Login state persists across page reloads using localStorage
- Automatic token restoration on app mount
- Secure cleanup on logout
- Profile data cached locally

### 3. Removed Dead Code**
- Deleted unused Gemini API service
- Removed placeholder weather/sports API calls
- Cleaned up unused dependencies

## Deployment Architecture

### Environment Setup

**Local Development**
- Clone repo: `git clone https://github.com/snucko/personal_dash.git`
- Install: `npm install`
- Create `.env.local` with `VITE_GOOGLE_CLIENT_ID` for localhost
- Run: `npm run dev`

**Production (Cloudflare Pages)**
- Connected GitHub repo to Cloudflare Pages
- Build command: `npm run build`
- Build output: `dist/`
- Environment variables set in Cloudflare dashboard

### Google OAuth Configuration

**Required Setup:**
1. Create OAuth Client ID in Google Cloud Console (Web Application type)
2. Add authorized origins:
   - Development: `http://localhost:3000`
   - Production: Your custom domain (e.g., `https://personal.tivnan.net`)
3. Enable required APIs:
   - Google Calendar API
   - Google Tasks API

**Critical Security Notes:**
- Each origin requires explicit authorization in Google Cloud Console
- Client ID is public but only works with authorized origins
- Access tokens are temporary and auto-refresh
- Never hardcode sensitive credentials in code

### Deployment Process

```bash
# 1. Make changes locally
# 2. Test with: npm run dev
# 3. Build: npm run build
# 4. Commit and push to GitHub
git add .
git commit -m "feature: description"
git push

# 5. Cloudflare Pages automatically deploys on push
# 6. To redeploy manually:
git commit --allow-empty -m "trigger: redeploy"
git push
```

**Adding New Environments:**
1. Update Google Cloud Console authorized origins
2. Add `VITE_GOOGLE_CLIENT_ID` env var in Cloudflare dashboard
3. Redeploy

## Known Issues & Solutions

### Issue: Google OAuth Not Loading on Vercel
**Cause:** Vercel's network infrastructure sometimes blocks access to Google's CDN
**Solution:** Deployed to Cloudflare Pages instead (works reliably)
**Lesson:** Always test OAuth providers with your hosting platform before production

### Issue: Session Lost on Page Reload
**Cause:** Tokens stored only in React state
**Solution:** Persist to localStorage with auto-restore
**Trade-off:** localStorage has XSS vulnerabilities; only store necessary data

### Issue: Google Script Loading Timing
**Cause:** Async script loading race conditions
**Solution:** Proper polling with timeout in AuthContext
**Improvement:** 50-second timeout with detailed logging

## File Structure

```
personal-dashboard/
├── components/
│   ├── CalendarWidget.tsx      # Google Calendar integration
│   ├── TodoWidget.tsx          # Google Tasks integration
│   ├── ErrorBoundary.tsx       # Error handling
│   ├── WidgetCard.tsx          # Reusable card component
│   ├── ClockWidget.tsx         # Real-time clock
│   ├── WeatherWidget.tsx       # Placeholder weather
│   └── SportsWidget.tsx        # Placeholder sports
├── contexts/
│   └── AuthContext.tsx         # OAuth state & logic
├── hooks/
│   └── useCurrentTime.ts       # Time management
├── services/
│   └── googleApiService.ts     # Google APIs (Calendar, Tasks)
├── types.ts                    # TypeScript definitions
├── constants.tsx               # Icons, config
├── App.tsx                     # Main app component
├── index.tsx                   # React entry point
├── vite.config.ts              # Vite configuration
└── index.html                  # HTML entry point
```

## Key Components

### AuthContext
Handles all OAuth lifecycle:
- Script loading and initialization
- Token acquisition and refresh
- Profile data management
- Logout and revocation
- localStorage persistence

### ErrorBoundary
Wraps each widget to catch and display errors without crashing app

### Widget Components
- Require `accessToken` prop to function
- Show setup guide if not authenticated
- Display errors gracefully
- Clean up on unmount

## Performance Optimizations

1. **Code Splitting:** Vite handles automatic chunking
2. **Lazy Loading:** React components lazy-load on demand
3. **Caching:** Cloudflare edge caching enabled
4. **Abort Controllers:** Cancel unnecessary requests
5. **Debouncing:** Prevents duplicate API calls

## Security Best Practices

✅ **Implemented:**
- OAuth 2.0 token flow
- Environment variable configuration
- `.env.local` in .gitignore
- HTTPS enforced (Cloudflare)
- Token expiration handling
- Proper error messages (no info leakage)

⚠️ **Considerations:**
- localStorage is vulnerable to XSS
- tokens are not httpOnly (can't use for secure backends)
- Client-side only - no backend session storage
- For production apps: use Auth0, Firebase, or similar

## Maintenance

### Adding New Features
1. Create component or service
2. Add TypeScript types
3. Wrap in ErrorBoundary
4. Request accessToken if needed
5. Test locally first

### Updating Dependencies
```bash
npm update
npm audit
git add package*.json
git commit -m "chore: update dependencies"
git push
```

### Monitoring
- Check Cloudflare Pages deployments for errors
- Review browser console for JavaScript errors
- Monitor Google API rate limits
- Check localStorage size (5MB limit)

## Testing Checklist

- [ ] Local dev works: `npm run dev`
- [ ] Production build: `npm run build`
- [ ] OAuth login flow
- [ ] Calendar data loads
- [ ] Tasks can be managed
- [ ] Session persists on reload
- [ ] Logout clears data
- [ ] Error handling works
- [ ] Responsive design
- [ ] No console errors

## Future Improvements

1. **Backend Session:** Move to secure backend with httpOnly cookies
2. **Error Logging:** Add Sentry or similar for error tracking
3. **Analytics:** Track user engagement
4. **Caching:** Implement service workers for offline support
5. **Dark Mode Toggle:** Add theme switcher
6. **Mobile App:** React Native version
7. **Backup:** Auto-backup calendar/tasks to cloud

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run lint            # Type check

# Git workflow
git status              # Check changes
git add .               # Stage all
git commit -m "msg"     # Commit
git push                # Push to main
```

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Google Calendar API](https://developers.google.com/calendar)
- [Google Tasks API](https://developers.google.com/tasks)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [OAuth 2.0](https://tools.ietf.org/html/rfc6749)

## Support

For issues:
1. Check browser console for errors
2. Verify Google Cloud credentials
3. Confirm domain in authorized origins
4. Check Cloudflare Pages deployment logs
5. Review GitHub Actions if CI/CD enabled
