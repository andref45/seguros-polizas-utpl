# Manual Startup Guide 

This guide details exactly how to start this project locally without relying on Docker (which may be unstable or require specific daemon configurations). Follow these steps strictly.

## 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm**

## 2. Environment Configuration

### Backend (`/backend`)
Ensure a `.env` file exists in `backend/.env` with the following keys (values are examples, preserve existing real values):

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

### Frontend (`/frontend`)
Ensure a `.env` file exists in `frontend/.env`. **Crucially, it must include `VITE_API_URL` pointing to the local backend.**

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=http://localhost:3000/api
```

> **Note**: If `VITE_API_URL` is missing, the frontend will not be able to communicate with the local backend.

## 3. Installation & Startup

Open two separate terminal instances.

### Terminal 1: Backend
```powershell
cd backend
npm install
npm run dev
```
*Wait for: "Server running on port 3000"*

### Terminal 2: Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Wait for: "Local: http://localhost:5173/"*

## 4. Verification

- **Backend Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health) (or similar, depending on routes)
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)

## Troubleshooting
- **Docker**: If `docker-compose up` fails due to daemon issues, strictly use the manual method above.
- **Ports**: Ensure ports 3000 and 5173 are free.
- **Dependencies**: If `npm install` fails, try deleting `node_modules` and `package-lock.json` and reinstalling.

## 5. Architecture Compliance & Gap Analysis

This section details the current state of the project versus the target architecture (Nancy-Only + Public Intake), identifying what is implemented and what remains to be done.

### Key Architectural Decisions
- **Architecture**: 3-Tier (Frontend: React/Vite, Backend: Node/Express, DB: Supabase).
- **Model**: Single Admin ("Nancy") manages all workflows. Public Users only have "Intake" capabilities (Claim reporting) and Read-Only access.
- **Payments**: Payroll Deduction Model (Nómina). No public web payments.

### Implemented Features (Current State)
- [x] **Public Intake (Siniestros)**: Simplified form (No 80/20 logic). PDF Upload support.
- [x] **Admin Dashboard ('Nancy')**: Dedicated view for claims management.
- [x] **Access Control**:
    - Middleware enforces `app_metadata.role = 'admin'` for critical routes.
    - Frontend conditionally renders "Gestionar Pólizas" and Dashboard metrics based on role.
- [x] **Database Schema**:
    - Refactored `siniestros` to remove 80/20 columns.
    - Added `monto_autorizado`, `monto_pagado`, `source`.
    - Added Unique Constraints to prevent duplicate claims.

### Gap Analysis (Pending Work)
#### 1. Backend Validations (Strict Mode)
- **Status FSM**: Enforce strict transitions (`Reportado` -> `En_tramite` -> `Pagado`).
- **RN007 (Integrity)**: Hard block on status change if no PDF validation passes (MIME + Hash).
- **Source Enum**: Ensure `source` column is strictly used.

#### 2. Payments Module (Payroll Refactor)
- **Current**: Public "Registrar Pago" form still exists (Legacy).
- **Target**:
    - Disable/Gate `registrarPago` for public users.
    - Implement `generarReporteNomina` (Export CSV/XLSX logic).
    - Implement `markAsPaid` (Reconciliation endpoint).

#### 3. Security & Compliance
- **RN010**: Session invalidation (Prevent concurrent logins).
- **RN009**: Data Masking in Admin exports.
- **Audit Logging**: Track who changed status or uploaded files.

### Handoff Notes for LLM
- **Migration**: Ensure `database/fix_schema_refactor.sql` is applied.
- **Seed**: Run `seed_nancy.js` to create the Admin user.
- **Next Task**: Start with "Backend: Refactor Payments" to align with the Payroll model.
