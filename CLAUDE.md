# CLAUDE.md

## Project Overview

Online Mail Promotion System (在线邮件推广系统) — B/S architecture for email marketing.

**Stack:** Vue 3 frontend + Node.js (Express) backend + MySQL

## Backend Layout

```
backend/src/
  index.js          # Express app entry
  db.js             # MySQL pool + query helper
  auth.js           # JWT, bcrypt, auth middleware, seed admin
  init-db.js        # Run schema.sql
  routes/
    auth.js
    customers.js
    notifications.js
```

## Commands

```bash
cd backend && npm install && npm run db:init && npm run dev
cd frontend && npm install && npm run dev
```

Default login: `admin` / `admin123`

## Project State

MVP: auth, customer Excel import, groups, notifications, dashboard. AI email generation, SMTP sending, IMAP monitoring not yet built.
