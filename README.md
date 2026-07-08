# Investment Project

Full-stack AI investment research app:
- Frontend: Next.js (`frontend`)
- Backend: Express + Prisma + LangGraph (`backend`)

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL connection string (Neon or any PostgreSQL)

## Setup

1. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Backend environment:

- Copy `backend/.env.example` to `backend/.env`
- Fill required values (`DATABASE_URL`, `JWT_SECRET`, `REFRESH_SECRET`)
- Add at least one LLM key: `GEMINI_API_KEY` or `OPENAI_API_KEY`
- Add `TAVILY_API_KEY` for web-search-enhanced analysis

3. Frontend environment (optional):

- Copy `frontend/.env.example` to `frontend/.env.local`
- Keep default URL unless backend runs on another host/port

## Run in development

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Build and production run

Backend:

```bash
cd backend
npm run build
npm run start
```

Frontend:

```bash
cd frontend
npm run build
npm run start
```

## Notes

- Backend health check: `http://localhost:5000/health`
- If analysis fails, verify API keys and database connectivity.
