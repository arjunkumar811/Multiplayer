# Deployment Guide

## Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +" → "Web Service"**
3. Connect GitHub repo: `arjunkumar811/Multiplayer`
4. Configure:
   - **Name:** `multiplayer-backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Free Plan**
5. Click **"Create Web Service"**
6. Wait 2-3 minutes for deployment
7. Copy your URL: `https://multiplayer-backend-xxxx.onrender.com`

## Update Frontend with Backend URL

Edit `client/.env`:
```
VITE_BACKEND_URL=https://your-backend-url.onrender.com
```

## Deploy Frontend to Vercel

### Option 1: CLI
```bash
cd client
npm install -g vercel
vercel
```

### Option 2: Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import `arjunkumar811/Multiplayer`
4. Configure:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   - **Name:** `VITE_BACKEND_URL`
   - **Value:** `https://your-backend-url.onrender.com`
6. Click **"Deploy"**

## Done!

Your app is now live:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

Open the frontend URL in multiple browsers to test multiplayer!
