# Taxflow Final Year Project Notes

## Project Title

Design and Implementation of a Tax Filing Automation System for Small Businesses in Ghana.

## Overview

Taxflow is a web-based prototype that assists Ghanaian small businesses with transaction recording, automated tax estimation, report generation, and filing reminders. The system focuses on the practical workflow a small business owner follows each month: record transactions, calculate tax liabilities, review reports, and prepare for filing.

## System Architecture

```mermaid
flowchart LR
  User["Small business owner"] --> Frontend["Next.js frontend"]
  Frontend --> API["NestJS REST API"]
  API --> Auth["Auth module"]
  API --> Transactions["Transactions module"]
  API --> Tax["Tax engine"]
  API --> Reports["Reports module"]
  Auth --> Database["JSON prototype database"]
  Transactions --> Database
  Reports --> Database
  Transactions --> Tax
  Reports --> Tax
```

## Main Modules

- Business profile: stores business name, email, TIN, industry, and VAT registration status.
- Authentication: provides prototype registration and login.
- Transactions: records income, expenses, and payroll.
- Tax engine: calculates VAT/NHIL/GETFund, PAYE, and withholding tax estimates.
- Reports: summarizes tax liabilities and business performance.
- Notifications: reminds users about filing deadlines.

## Data Flow

```mermaid
sequenceDiagram
  actor Owner as Business Owner
  participant UI as Next.js UI
  participant API as NestJS API
  participant Tax as Tax Engine
  participant DB as JSON Database

  Owner->>UI: Enters transaction
  UI->>API: POST /api/transactions
  API->>Tax: Calculate VAT/PAYE/WHT
  Tax-->>API: Tax amounts
  API->>DB: Save transaction
  DB-->>API: Stored record
  API-->>UI: Updated transaction
  UI->>API: GET /api/reports/summary
  API->>DB: Load user transactions
  API-->>UI: Tax summary
```

## Use Case Diagram

```mermaid
flowchart TB
  Owner["Business Owner"]
  Register["Register/Login"]
  Profile["Manage Business Profile"]
  Record["Record Transactions"]
  Calculate["Calculate Taxes"]
  Reports["View Reports"]
  Reminders["Receive Filing Reminders"]
  Print["Print/Save Report"]

  Owner --> Register
  Owner --> Profile
  Owner --> Record
  Record --> Calculate
  Owner --> Reports
  Reports --> Print
  Owner --> Reminders
```

## ERD

```mermaid
erDiagram
  USER ||--o{ TRANSACTION : records
  USER ||--o{ NOTIFICATION : receives

  USER {
    string id
    string email
    string passwordHash
    string businessName
    string tin
    boolean vatRegistered
    string industryType
  }

  TRANSACTION {
    string id
    string userId
    string type
    number amount
    string category
    string date
    string description
    number vatAmount
    number payeAmount
    number whtAmount
  }

  NOTIFICATION {
    string id
    string userId
    string type
    string title
    string message
    string date
    boolean read
  }
```

## Tax Rules Used in Prototype

- VAT/NHIL/GETFund combined estimate: 20% for VAT-registered businesses.
- PAYE estimate: employee SSNIT deduction of 5.5%, then monthly graduated bands.
- Withholding tax estimate: goods 3%, works 5%, services 7.5%.
- PAYE and withholding tax reminder: 15th day of the following month.
- VAT/NHIL reminder wording: last working day of the following month.

Tax rates and deadlines are centralized in `backend/src/tax/tax.constants.ts` so they can be reviewed and updated.

## Testing Strategy

- Unit tests validate tax calculation formulas.
- Validation tests reject invalid transaction input and invalid report date ranges.
- Report tests verify summary totals and notification ownership behavior.
- Build checks confirm the frontend and backend compile successfully.

## Demo Script

1. Start the backend on `http://localhost:3001`.
2. Start the frontend on `http://localhost:3000`.
3. Register or use the demo account from `backend/data/demo-db.json`.
4. Show dashboard totals.
5. Record an income transaction and explain output VAT and WHT.
6. Record an expense transaction and explain input VAT and WHT withheld.
7. Record payroll and explain PAYE.
8. Open reports and show estimated tax owed.
9. Open notifications and explain deadline reminders.

## Limitations

- The project uses JSON storage to keep the prototype easy to run during assessment.
- Authentication is simplified and must be strengthened before production use.
- The system assists filing but does not submit returns directly to GRA.
- Tax guidance must be validated against current GRA publications before real use.
- Offline mode is useful for demonstrations but duplicates some logic from the backend.

## Future Work

- Replace JSON storage with PostgreSQL.
- Add secure password hashing and production-grade sessions.
- Split the frontend into reusable route-level screens and components.
- Add CSV import for transaction data.
- Add accountant/admin roles.
- Explore WhatsApp transaction entry.
- Investigate direct GRA integration if an official API is available.
