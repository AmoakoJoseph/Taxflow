# Taxflow Backend

NestJS API for the Taxflow final year project prototype.

## Responsibilities

- Prototype authentication and business profile storage.
- Transaction CRUD for income, expenses, and payroll.
- Ghana tax estimation for VAT/NHIL/GETFund, PAYE, and withholding tax.
- Report summaries for business performance and estimated tax owed.
- Notification reminders for filing deadlines.

## Run

```bash
npm install
npm run start:dev
```

The API runs on `http://localhost:3001`.

## Test

```bash
npm test -- --runInBand
npm run build
```

## Important Files

- `src/tax/tax.constants.ts`: centralized tax rates and filing deadline assumptions.
- `src/tax/tax.service.ts`: tax calculation logic.
- `src/transactions/transaction.dto.ts`: runtime request validation for transaction input.
- `src/reports/reports.service.ts`: tax summary and notification behavior.
- `data/demo-db.json`: clean demo dataset for final year presentation.

## Prototype Notes

This backend uses JSON file persistence to keep the academic prototype easy to run. A production version should migrate to PostgreSQL, use stronger password hashing, and replace the simple session token with a production-grade authentication flow.
