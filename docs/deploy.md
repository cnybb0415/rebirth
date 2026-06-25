# Deploy (Vercel + Render)

This project has two parts:
- Next.js app (frontend + `/api/*` routes) → deploy to Vercel
- Spring Boot chart backend (`korea-music-chart-api`) → deploy to Render

## 1) Deploy backend (Render)

1. Go to Render → **New** → **Blueprint**
2. Choose this GitHub repo and let Render read `render.yaml`
3. Create the service (it deploys the backend using **Docker**)
4. After deploy finishes, copy the public URL:
   - Example: `https://korea-music-chart-api.onrender.com`

If you created a service manually (not Blueprint), use Docker instead of a native runtime:

- **Runtime**: Docker
- **Dockerfile path**: `korea-music-chart-api/Dockerfile`
- **Docker build context**: `korea-music-chart-api`

Troubleshooting:

- If logs show **Node.js** being used and `JAVA_HOME` errors, you created the service with the wrong runtime.
  Create a new service using **Blueprint** (recommended) or select **Docker** when creating the service.

Quick checks:
- Open `https://<RENDER_URL>/` (should respond)
- Or hit a known endpoint like `https://<RENDER_URL>/melon/chart/EXO`

## 2) Deploy frontend (Vercel)

1. Import the GitHub repo in Vercel
2. Add these Environment Variables (Settings → Environment Variables):

- `YOUTUBE_API_KEY` = your YouTube Data API key
- `KOREA_MUSIC_CHART_API_BASE_URL` = `https://<RENDER_URL>` (from step 1)

Optional:
- `YOUTUBE_VIDEO_ID` = default video id

3. Redeploy (Deployments → Redeploy)

## 3) Point custom domain (Cafe24 DNS → Vercel)

Set DNS records:
- Root domain `exo-strm.com`
  - Type: `A`
  - Host: `@`
  - Value: `76.76.21.21`

- `www.exo-strm.com`
  - Type: `CNAME`
  - Host: `www`
  - Value: `cname.vercel-dns.com`

Then go to Vercel → Project → Settings → Domains and verify.
