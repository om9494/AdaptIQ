# Deployment Guide

This repository is set up for:

- `Render` for the Flask API and PostgreSQL database
- `Vercel` for the React frontend

This is the recommended setup because the backend needs a persistent PostgreSQL database and the frontend is a Vite SPA.

## 1. Push the repository to GitHub

The repo is configured to use:

- `origin`: `https://github.com/om9494/AdaptIQ.git`
- branch: `main`

Only source files are intended to be pushed. Local secrets and heavy runtime folders are ignored by `.gitignore`.

## 2. Deploy the backend and database on Render

This repo includes [`render.yaml`](./render.yaml), so you can deploy with a Render Blueprint.

### Steps

1. Open the Render dashboard.
2. Click `New +` -> `Blueprint`.
3. Connect the GitHub repo `om9494/AdaptIQ`.
4. Select the `main` branch.
5. Render will detect [`render.yaml`](./render.yaml).
6. When prompted for environment variables, set:
   - `GEMINI_API_KEY`
   - `CORS_ORIGINS`

### Recommended `CORS_ORIGINS`

Use your frontend URL, for example:

```text
https://your-project.vercel.app
```

If you also want localhost during development, use:

```text
https://your-project.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

### What Render will do automatically

- create a PostgreSQL database
- install backend dependencies
- run [`backend/seed_fresh_database.py`](./backend/seed_fresh_database.py) during service startup
- start the Flask API with Gunicorn

That seed flow will populate the hosted database with the demo users, educator courses, course lessons, and seeded catalog data without re-seeding a non-empty database.

### Backend verification

After deployment, open:

```text
https://your-render-backend.onrender.com/health
```

You should get:

```json
{"status":"ok"}
```

## 3. Deploy the frontend on Vercel

This repo includes [`frontend/vercel.json`](./frontend/vercel.json) so client-side routes keep working after refresh.

### Steps

1. Open the Vercel dashboard.
2. Click `Add New...` -> `Project`.
3. Import the GitHub repo `om9494/AdaptIQ`.
4. Set `Root Directory` to `frontend`.
5. Confirm:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add this environment variable:

```text
VITE_API_URL=https://your-render-backend.onrender.com
```

7. Deploy the project.

## 4. Final CORS check

After Vercel gives you the final frontend URL:

1. Go back to your Render backend service.
2. Open `Environment`.
3. Update `CORS_ORIGINS` to the exact Vercel URL if needed.
4. Save and redeploy the backend.

## 5. How the seeded course data reaches the server

The hosted database is not stored in Git. It is created on Render and then populated from code.

The seeded data comes from:

- [`backend/course_catalog.py`](./backend/course_catalog.py)
- [`backend/seed.py`](./backend/seed.py)
- [`backend/seed_fresh_database.py`](./backend/seed_fresh_database.py)

That means your hosted server will recreate the same educator course catalog and seeded learning content inside the Render PostgreSQL database on first deploy.

## 6. If you need to seed a fresh server manually

Only run this on a brand-new empty database:

```bash
cd backend
python seed_fresh_database.py
```

If the database already has rows, the script will safely skip.

## 7. Optional Render-only frontend deployment

If you prefer not to use Vercel, you can deploy the frontend as a Render `Static Site` instead.

### Render Static Site settings

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL=https://your-render-backend.onrender.com`

Then add a rewrite rule in Render:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`
