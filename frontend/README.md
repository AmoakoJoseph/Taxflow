# Taxflow Frontend

Next.js mobile-first interface for the Taxflow final year project prototype.

## Responsibilities

- Business registration and login screens.
- Dashboard with estimated tax and transaction totals.
- Ledger entry and transaction management.
- Built-in tax calculators.
- Report view for presentation and printing.
- Chat-style tax helper with project-safe guidance.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend expects the backend API at `http://localhost:3001`.

## Build

```bash
npm run build
```

## Prototype Notes

The current UI is intentionally concentrated in `src/app/page.js` for rapid demonstration. A production version should split it into route-level screens, reusable components, API hooks, and shared tax display utilities.
