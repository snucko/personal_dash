# Security Checklist

## For Developers

### Local Development
1. ✅ `.env.local` is in `.gitignore` - your Client ID stays private
2. ✅ Create `.env.local` from `.env.example`
3. ✅ Never commit `.env.local` to Git
4. ✅ Verify with `git status` before pushing (should show nothing related to `.env`)

### Before Deployment
```bash
# Check that sensitive files are ignored
git status

# Verify no secrets in staged files
git diff --cached | grep -iE "client.?id|secret|password|token"
```

## For GitHub/Vercel Workflow

### Step 1: Push to GitHub
```bash
# Make sure .env.local is NOT staged
git add .
git status  # Verify .env.local is NOT listed

# Push
git push origin main
```

### Step 2: Configure Vercel/Cloudflare
**DO NOT put your Client ID in code**

Instead, use environment variables:

**Vercel:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings > Environment Variables
4. Add: `VITE_GOOGLE_CLIENT_ID` = `YOUR_PRODUCTION_CLIENT_ID`
5. Deploy

**Cloudflare Pages:**
1. Go to Cloudflare Pages
2. Select your project
3. Settings > Environment Variables
4. Add: `VITE_GOOGLE_CLIENT_ID` = `YOUR_PRODUCTION_CLIENT_ID`
5. Deploy

## Security Notes

- **Google Client ID is NOT a secret** - it's public-facing. It only works with authorized origins.
- **Authorized Origins prevent misuse** - Always add your exact deployment URLs to Google Cloud Console
- **Separate IDs per environment** - Use different Client IDs for localhost, staging, and production
- **Token rotation** - Access tokens are temporary (1 hour) and refreshed automatically
- **No backend secrets** - This app is entirely front-end, no API keys needed

## What's Safe to Commit

✅ Source code  
✅ `.env.example` (shows structure only)  
✅ Config files (`tsconfig.json`, `vite.config.ts`)  
✅ Dependencies (`package.json`, `package-lock.json`)  

## What's NOT Safe to Commit

❌ `.env.local` (contains your local Client ID)  
❌ `.env.production` (if you have one)  
❌ Any file with API keys or tokens  

---

**TL;DR:** Push code to GitHub without `.env.local`, add `VITE_GOOGLE_CLIENT_ID` as an environment variable in your hosting platform.
