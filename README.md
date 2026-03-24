# Personal Dashboard

A sleek, modern personal dashboard designed to give you a quick overview of your day. This dashboard integrates with Google Calendar and Google Tasks to keep you organized.

## 🚀 Features

- **Google Calendar Integration:** Real-time sync with your primary Google Calendar.
- **Google Tasks Integration:** Manage your to-do list directly from the dashboard.
- **Real-time Clock:** Always stay on schedule with a high-precision digital clock.
- **Weather Overview:** Quick look at current conditions (currently using placeholder data for Bristol, RI).
- **Sports Scores:** Stay updated on the Boston Bruins (currently using placeholder data).
- **Modern UI:** Built with a dark, sophisticated aesthetic using Tailwind CSS and smooth animations via Motion.
- **Error Boundaries:** Graceful error handling for individual widgets.
- **Type-Safe:** Full TypeScript support with proper OAuth types.

## 🛠️ Setup Instructions (Google Cloud)

To enable the Calendar and Tasks widgets, you must create your own Google Cloud credentials:

### 1. Configure OAuth Consent Screen
Google requires this before you can create a Client ID.
1. Go to the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent).
2. Select **External** and click **Create**.
3. Fill in the **App name** (e.g., "My Dashboard"), **Support email**, and **Developer contact info**.
4. Click **SAVE AND CONTINUE** through the remaining sections.

### 2. Create OAuth Client ID
1. Go to [Credentials](https://console.cloud.google.com/apis/credentials).
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3. Select **Web application** as the Application type.

### 3. Add Authorized JavaScript Origin
Under **Authorized JavaScript origins**, click **ADD URI** and paste your deployment URL (e.g., `https://your-dashboard.vercel.app`).

### 4. Update .env.local
Copy `.env.example` to `.env.local` and add your Client ID:
```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

### 5. Enable APIs (CRITICAL)
You must enable these APIs in your Google Cloud project or the widgets will fail:
1. Enable the [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com).
2. Enable the [Google Tasks API](https://console.cloud.google.com/apis/library/tasks.googleapis.com).

## 📦 Deployment

This is a standard Vite React application. You can deploy it to Vercel or Cloudflare Pages.

### Environment Variables
The app requires `VITE_GOOGLE_CLIENT_ID` to be set for authentication. This is NOT a secret (it's public-facing), but each deployment URL needs its own Client ID.

1. Copy `.env.example` to `.env.local` for local development
2. For production deployment, add the environment variable to your hosting platform (do NOT commit `.env.local` to Git)

### Vercel
1. Push your code to GitHub (`.env.local` is in `.gitignore` and won't be committed)
2. Connect your repository to Vercel
3. In Vercel Dashboard > Settings > Environment Variables, add:
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** Your production Client ID
4. Vercel will automatically detect Vite settings
5. Deploy

### Cloudflare Pages
1. Push your code to GitHub (`.env.local` is in `.gitignore` and won't be committed)
2. Connect your repository to Cloudflare Pages
3. In Cloudflare Pages > Settings > Environment Variables, add:
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** Your production Client ID
4. Set **Build Command** to `npm run build`
5. Set **Build Output Directory** to `dist`
6. Deploy

### Important: Separate Client IDs
You **must** create separate OAuth Client IDs for each deployment:
- One for `http://localhost:3000` (local development)
- One for your Vercel/Cloudflare deploy URL

Add each URL to your Client ID's "Authorized JavaScript origins" in Google Cloud Console.

## 💻 Tech Stack

- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Animations:** Motion
- **Icons:** Lucide React
- **API Integration:** Google Identity Services (OAuth 2.0)

## 🛠️ Local Development

1. Clone the repository
2. Copy `.env.example` to `.env.local` and add your local Client ID
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Open your browser to `http://localhost:3000`

## 📋 Architecture

- **AuthContext:** Centralized authentication state (no prop drilling)
- **Error Boundaries:** Each widget wrapped for graceful error handling
- **Google API Service:** Abstracted API calls with abort controllers to prevent memory leaks
- **Responsive Design:** Mobile-first approach with Tailwind CSS

## 🔒 Security

See [SECURITY.md](SECURITY.md) for deployment security checklist.

TL;DR: Never commit `.env.local` to Git. Add `VITE_GOOGLE_CLIENT_ID` as an environment variable in your hosting platform.
