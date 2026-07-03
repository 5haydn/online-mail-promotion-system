# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Online Mail Promotion System (在线邮件推广系统) — a B/S architecture platform for intelligent email marketing. Users upload customer Excel files, the system uses the Doubao (豆包) LLM to generate personalized promotional emails, sends them in bulk via SMTP, and monitors replies via IMAP with real-time push notifications.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + Element Plus + Axios |
| Backend | Spring Boot 3.x or FastAPI (TBD) |
| Database | Volcano Cloud RDS MySQL 8.0 |
| Cache/Queue | Volcano Cloud Redis |
| Object Storage | Volcano Cloud TOS |
| AI | Doubao Open Platform API |
| Email | SMTP (sending) + IMAP (reply polling) |
| Real-time Push | WebSocket + Browser Notification API |

## Architecture (Planned)

The system follows a standard B/S architecture deployed on Volcano Cloud:

- **Frontend (Vue 3 SPA)**: Admin dashboard with Excel upload, email preview/editing, sending progress, message center, and analytics dashboard.
- **Backend API Server**: RESTful API handling auth, file parsing, Doubao API integration, email sending orchestration, and push notifications.
- **Background Job Service**: Scheduled tasks (Quartz or Redis delayed tasks) for IMAP reply polling and asynchronous batch email sending with rate limiting.
- **WebSocket Server**: Real-time push of new reply notifications and sending progress updates to connected browsers.

### Core Modules (from PRD)

1. **Auth & User Management** — Login, role-based access (super admin, operator, read-only viewer), operation logging.
2. **Excel Customer Data Management** — Template download, xlsx/xls upload to TOS, async parsing, validation (email format, dedup, error tagging), error file export, customer grouping/tagging.
3. **Doubao AI Email Generation** — Two modes: unified template (one prompt for all) and personalized (per-customer prompt with Excel fields). Supports tone presets (formal, friendly, concise), custom prompts, content safety filtering.
4. **Bulk Email Sending** — Multi-SMTP-account rotation with rate limiting, immediate/scheduled/throttled send strategies, HTML rich text editing, attachment support, real-time progress with failure reasons.
5. **Reply Monitoring & Push** — IMAP polling via scheduled tasks, reply-to-send matching by customer email, reply classification (inquiry, rejection, bounce, interest), real-time WebSocket + browser desktop notification, optional DingTalk/WeCom integration.
6. **Message Center & Analytics Dashboard** — Unified notifications with read/unread, data dashboard (customer count, AI generation count, send success rate, reply rate, leads), multi-dimension reports with Excel/PDF export.
7. **System Configuration** — Doubao API key and model params, SMTP/IMAP account config, push channel config, file upload limits, TOS path config.

### Key Data Flow

1. Upload Excel → TOS → backend parses/validates → MySQL
2. Select customer group + configure prompt → backend calls Doubao API → generates email drafts
3. User previews/edits drafts → configures SMTP account + send strategy → async bulk send → records results
4. Scheduled IMAP poll → match replies to sent emails → write to DB → WebSocket push → browser notification
5. Operator views replies in message center → optionally uses Doubao to generate reply suggestions

### Security Design

- Token-based auth with role-based access control
- Doubao API keys and email credentials encrypted at rest in MySQL, never returned to frontend
- Volcano Cloud security groups restrict inbound/outbound IPs
- TOS files set to private read, upload file type whitelist
- AI-generated content passes sensitive-word and compliance checks
- Full operation audit logging

## Project State

This repository currently contains only the PRD (`prd.txt`). Implementation has not started. The backend framework (Spring Boot vs. FastAPI) and other implementation details are not yet decided.
