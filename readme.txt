Online Mail Promotion System (在线邮件推广系统)
==============================================

Direction: AI-Driven Email Marketing

Discarded: Traditional batch-and-blast mail promotion route.
Chosen:   AI-generated personalized email marketing system.

Core Shift:
  - AI generates email content (subject lines, body, variants) per customer/segment
  - LLM-powered personalization instead of static templates
  - Intelligent send timing, A/B variant generation, and campaign optimization

Foundation (MVP — keeping):
  - Auth (JWT + bcrypt)
  - Customer import (Excel)
  - Groups / segmentation
  - Dashboard

To Build:
  - AI email generation (LLM API integration)
  - SMTP sending pipeline
  - IMAP reply monitoring
  - Campaign management with AI-assisted workflows

Stack: Vue 3 + Node.js (Express) + MySQL + LLM API
