# System Architecture: AI Investment Research Agent

This document defines the system components, data flow, security model, and structural layout of the AI Investment Research Agent.

## System Components

```mermaid
graph TD
    %% Frontend (Client Side)
    subgraph Client [Frontend: Next.js App Router]
        LP[Landing Page]
        Dash[Dashboard Page]
        Det[Company Details Page]
        Hist[History Page]
        NextAuth[JWT Cookie Auth Router]
    end

    %% Backend Service
    subgraph API [Backend: Node.js Express API]
        Server[server.ts]
        AuthMid[Protect Middleware]
        AuthCtrl[AuthController]
        ResCtrl[ResearchController]
        Prisma[Prisma Client Singleton]
    end

    %% DB Layer
    subgraph DB [Database: Neon PostgreSQL Cloud]
        UsersTab[(Users)]
        TokenTab[(Refresh Tokens)]
        ReportTab[(Research Reports)]
    end

    %% AI Orchestrator
    subgraph AgentSystem [AI: LangGraph Engine]
        LGraph[LangGraph Coordinator]
        TavilyTool[Tavily Search Tool]
        YFinanceTool[Yahoo Finance Tool]
        
        %% Nodes inside Graph
        N1[Research Node]
        N2[Financials Node]
        N3[Sentiment Node]
        N4[SWOT & Risk Node]
        N5[Decision Node]
    end

    %% Relations
    LP --> NextAuth
    Dash -->|GET /api/research/history| ResCtrl
    Det -->|POST /api/research/analyze| ResCtrl
    
    ResCtrl --> AuthMid
    AuthMid --> Server
    
    AuthCtrl -->|Manage user & session| Prisma
    ResCtrl -->|Daily cache check & save| Prisma
    
    Prisma --> UsersTab
    Prisma --> TokenTab
    Prisma --> ReportTab

    ResCtrl -->|Trigger workflow| LGraph
    LGraph --> N1
    N1 --> TavilyTool
    N1 --> N2
    N2 --> YFinanceTool
    N2 --> N3
    N3 --> TavilyTool
    N3 --> N4
    N4 --> N5
    N5 -->|Final output JSON| ResCtrl
```

### 1. Frontend (Next.js App Router)
- **Role**: Displays landing pages, dashboards, financial charts, search forms, and historical reports.
- **Tech Stack**: Next.js (TypeScript), React, Tailwind CSS, shadcn/ui, Framer Motion, Recharts.
- **Session Control**: Authentic credentials stored inside secure HttpOnly cookies, automatically attached to outgoing backend requests.

### 2. Backend (Express API Server)
- **Role**: Coordinates route security, DB calls, caching daily analysis, and triggers the AI Agent graph.
- **Tech Stack**: Express.js (TypeScript), Prisma ORM, CORS, Helmet, express-rate-limit.
- **Session Auth**: JWT verification middleware reading headers/cookies.

### 3. Database Layer (PostgreSQL)
- **Role**: Stores persistent user records, refresh session tokens, and compiled company reports.
- **Schema Management**: Managed via Prisma ORM targeting Neon Cloud PostgreSQL database.

### 4. AI Orchestration Service (LangGraph & LangChain)
- **Role**: Runs a multi-agent state-machine loop that gathers research, extracts financial metrics, searches for recent news, evaluates SWOT models, and issues the final recommendation.
- **Tools**: Tavily Search API, Yahoo Finance NPM wrapper (`yahoo-finance2`).
