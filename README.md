# Taxflow

Taxflow is a final year project prototype for tax filing automation for small businesses in Ghana. It helps a business owner record income, expenses, and payroll, then estimates VAT/NHIL/GETFund, PAYE, withholding tax, and basic filing reports.

The project is intentionally scoped as an academic MVP: it demonstrates the core workflow and tax-rule engine, while documenting the production limitations that would need to be addressed before real commercial use.

## Problem Statement

Many small businesses in Ghana keep financial records manually and may miss tax deadlines or misunderstand VAT, PAYE, and withholding tax rules. Taxflow provides a simple mobile-first interface for recording business transactions and generating tax summaries that can assist monthly filing preparation.

## Objectives

- Capture business profile information such as business name, TIN, industry, and VAT registration status.
- Record income, expense, and payroll transactions.
- Automatically estimate VAT, PAYE, and withholding tax from transaction data.
- Generate a monthly tax summary and simple reporting view.
- Notify users about relevant PAYE/WHT and VAT/NHIL filing timelines.
- Demonstrate a clear architecture suitable for further expansion into a production system.

## Features

- Business registration and login flow for the prototype.
- Mobile-first dashboard for Ghanaian SMEs.
- Transaction ledger with income, expense, and payroll categories.
- Tax calculators for VAT, PAYE, and withholding tax.
- GRA-style summary reports for review and printing.
- Notification reminders for filing deadlines.
- Offline demo mode when the backend is not running.

## Tech Stack

- Frontend: Next.js, React, CSS
- Backend: NestJS, TypeScript
- Prototype persistence: JSON file storage
- Testing: Jest

## Project Structure

```text
Taxflow/
  backend/      NestJS API, tax engine, reports, prototype JSON database
  frontend/     Next.js mobile-first user interface
  docs/         Final year project documentation and diagrams
```

## Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start the backend:

```bash
cd backend
npm run start:dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the frontend at:

```text
http://localhost:3000
```

The backend API runs at:

```text
http://localhost:3001
```

## Demo Data

A clean sample dataset is available at `backend/data/demo-db.json`. To use it for a demonstration, back up your current `backend/data/db.json`, then copy `demo-db.json` to `db.json`.

Demo login:

```text
Email: demo@taxflow.local
Password: password123
```

The default password is kept only for final year project demonstration purposes. It is documented as a limitation, not a production recommendation.

## Testing

Run backend tests:

```bash
cd backend
npm test -- --runInBand
```

Build backend:

```bash
cd backend
npm run build
```

Build frontend:

```bash
cd frontend
npm run build
```

## Academic Scope and Limitations

Taxflow is a prototype. It does not directly file returns with the Ghana Revenue Authority. It prepares estimates and reports to assist a business owner.

Known limitations:

- JSON file storage is used for demonstration instead of PostgreSQL.
- Authentication is simplified for the project demo.
- Tax rules must be reviewed against current GRA guidance before real-world use.
- Offline mode is a demonstration fallback and should not be treated as authoritative.
- Direct GRA integration and WhatsApp transaction entry are future work.

## Documentation

See [docs/FINAL_YEAR_PROJECT.md](docs/FINAL_YEAR_PROJECT.md) for architecture diagrams, data flow, use cases, ERD, testing approach, and presentation notes.
