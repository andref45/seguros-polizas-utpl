# Dockerization Strategy

## Goals
Enable "One-Command Run" via `docker-compose up`.

## Containers

### 1. Backend (`seguros-backend`)
*   **Base Image**: `node:18-alpine` (Lightweight, reliable).
*   **Context**: `backend/`
*   **Ports**: Exposed on `3000`.
*   **Env**: Injected via `docker-compose` or `.env` file.

### 2. Frontend (`seguros-frontend`)
*   **Strategy**: Multi-stage build.
    *   **Builder**: `node:18-alpine` -> runs `npm run build`.
    *   **Runner**: `nginx:alpine` -> serves `dist/` folder.
*   **Context**: `frontend/`
*   **Ports**: Exposed on `80` (mapped to `5173` or `8080`).
*   **Config**: `nginx.conf` for SPA routing (fallback to index.html).

## Orchestration
*   `docker-compose.yml`: Defines services, networks, and env vars.
