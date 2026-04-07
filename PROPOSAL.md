# NaoBot — AI-Powered Support System
## Project Proposal
### National Automobile Olympiad 2026

---

**Prepared for:** Automobile Skills Development Council of India (ASDC)
**Project:** National Automobile Olympiad 2026
**Document Type:** Technical Proposal
**Date:** April 2026

---

## 1. Executive Summary

NaoBot is a purpose-built intelligent support chatbot and administration platform developed exclusively for the National Automobile Olympiad 2026 (NAO 2026). It enables participants, students, institutions, and visitors to receive instant, accurate answers about the event through a conversational interface — available 24/7 without any human intervention.

The system combines a fast FAQ engine with OpenAI's GPT models as a fallback, ensuring that common questions are answered instantly and free of cost, while complex or unanticipated queries are handled intelligently by AI.

The platform is fully managed through a secure admin panel and can be embedded on any external website with a single line of code.

---

## 2. Problem Statement

Large-scale national events like NAO 2026 receive thousands of repetitive queries from participants and institutions — about registration, eligibility, dates, venues, fees, team composition, and prizes. Managing these manually through email or phone:

- Creates significant workload for the organizing team
- Results in delayed responses and poor participant experience
- Provides no visibility into what participants are asking
- Cannot scale during peak registration periods

---

## 3. Proposed Solution

NaoBot addresses this by providing:

- An always-on chat interface that answers questions instantly
- A hybrid engine that uses a curated FAQ database first, then falls back to AI
- A complete admin panel to manage content, monitor usage, and configure AI
- An embeddable widget that works on any website — no redevelopment needed

---

## 4. Key Features

### 4.1 Participant-Facing Chat Widget

| Feature | Description |
|---|---|
| Registration Gate | Users provide name, email, and phone before accessing the chat |
| Hybrid Response Engine | FAQ lookup first (instant, free), OpenAI fallback for unmatched queries |
| Suggested Questions | First-time users see quick-tap suggestions to get started |
| Typing Indicator | Animated dots while NaoBot is generating a response |
| Timeout Handling | 15-second timeout with graceful error message |
| Character Limit | 300-character input cap to prevent prompt abuse |
| Source Badge | Each response shows whether it came from FAQ or AI |
| Embeddable | Works on any website via a single `<script>` tag |

### 4.2 Admin Panel

| Module | Features |
|---|---|
| **Dashboard** | Total users, total chats, FAQ hit rate, AI usage, today's activity, quick links |
| **FAQ Manager** | Add, edit, delete FAQ entries with keyword tagging; hover-reveal actions |
| **Bulk Import** | Upload CSV to add multiple FAQs at once with preview and validation |
| **Users** | View all registered participants, search by name/email/phone, export CSV |
| **Chat Logs** | Full conversation history, filter by FAQ/AI source, click to expand answers |
| **Analytics** | Top FAQ entries by hit count, hourly activity chart, FAQ vs AI breakdown |
| **Unanswered Questions** | AI-answered questions flagged for FAQ conversion with one-click add |
| **AI Settings** | Configure OpenAI API key, model, system prompt, max tokens, enable/disable toggle, live test |
| **Embed Code** | Copy-paste script tag or iframe code for deployment on any external website |

### 4.3 Security

| Feature | Description |
|---|---|
| Admin Authentication | JWT-based login with 8-hour session, httpOnly cookies |
| Route Protection | Middleware guards all `/admin/*` routes |
| Rate Limiting | 20 requests per IP per minute on the chat API |
| API Key Masking | OpenAI key stored securely, only last 4 characters shown in UI |
| CORS Headers | Controlled cross-origin access for the embeddable widget |

---

## 5. Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   External Websites                  │
│         <script src="naobot.js"> embed tag           │
└──────────────────────┬──────────────────────────────┘
                       │ iframe
┌──────────────────────▼──────────────────────────────┐
│              Next.js 15 Application                  │
│                                                      │
│  ┌─────────────┐   ┌──────────────┐                 │
│  │  /widget    │   │  /admin/*    │                 │
│  │  Chat UI    │   │  Admin Panel │                 │
│  └──────┬──────┘   └──────┬───────┘                 │
│         │                 │                          │
│  ┌──────▼─────────────────▼───────┐                 │
│  │         API Routes              │                 │
│  │  /api/ask  /api/register        │                 │
│  │  /api/admin/*                   │                 │
│  └──────┬──────────────────────────┘                 │
│         │                                            │
│  ┌──────▼──────────┐   ┌──────────────────┐         │
│  │  PostgreSQL DB  │   │   OpenAI API     │         │
│  │  users          │   │   GPT-4o-mini    │         │
│  │  faqs           │   │   (configurable) │         │
│  │  chat_logs      │   └──────────────────┘         │
│  └─────────────────┘                                 │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL 18 |
| AI Provider | OpenAI API (GPT-4o-mini default) |
| Authentication | JWT via `jose`, httpOnly cookies |
| Styling | Pure CSS-in-JS, Apple-inspired design system |
| Deployment | Node.js compatible (Vercel, Railway, VPS) |

---

## 6. FAQ Response Engine

The hybrid engine works in two stages:

**Stage 1 — FAQ Lookup (instant)**
- Incoming question is tokenised into keywords
- Keywords are matched against the `faqs` table using PostgreSQL array overlap (`&&`)
- If matched, the answer is returned immediately — no API cost, sub-100ms response

**Stage 2 — AI Fallback (when no FAQ match)**
- Question is sent to OpenAI with a custom system prompt
- Response is returned to the user and logged
- The question is flagged in the "Unanswered Questions" admin panel for future FAQ addition

This approach minimises OpenAI API costs while ensuring no question goes unanswered.

---

## 7. Embeddable Widget

NaoBot can be deployed on any website — the NAO 2026 official site, partner institution websites, or social campaign landing pages — with a single line of code:

```html
<script src="https://your-domain.com/naobot.js" async></script>
```

The widget:
- Loads inside an isolated iframe (no CSS or JS conflicts with the host site)
- Collects user registration data before opening the chat
- Routes all API calls back to the NAO server
- Saves all data (registrations, chat logs) to the central admin panel

---

## 8. Data Captured

Every interaction generates structured data available in the admin panel:

- **User registrations** — name, email, phone, timestamp
- **Chat conversations** — question, answer, source (FAQ/AI), timestamp
- **FAQ analytics** — hit counts per entry, hourly activity, FAQ vs AI ratio
- **Unanswered questions** — questions that required AI, ready for FAQ conversion

---

## 9. Deliverables

| # | Deliverable | Status |
|---|---|---|
| 1 | Participant chat widget (web) | ✅ Complete |
| 2 | User registration with DB persistence | ✅ Complete |
| 3 | Hybrid FAQ + AI response engine | ✅ Complete |
| 4 | Admin login with JWT authentication | ✅ Complete |
| 5 | Admin dashboard with live stats | ✅ Complete |
| 6 | FAQ Manager (add/edit/delete/import) | ✅ Complete |
| 7 | Users panel with CSV export | ✅ Complete |
| 8 | Chat logs with search and filter | ✅ Complete |
| 9 | FAQ Analytics with charts | ✅ Complete |
| 10 | Unanswered Questions panel | ✅ Complete |
| 11 | AI Settings panel | ✅ Complete |
| 12 | Embeddable widget + embed code page | ✅ Complete |
| 13 | PostgreSQL database integration | ✅ Complete |
| 14 | Rate limiting and security hardening | ✅ Complete |

---

## 10. Environment & Configuration

The system requires the following environment variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key for AI fallback |
| `ADMIN_EMAIL` | Admin panel login email |
| `ADMIN_PASSWORD` | Admin panel login password |
| `JWT_SECRET` | Secret key for JWT signing |

---

## 11. Future Enhancements (Out of Scope)

The following can be added in subsequent phases:

- Multi-language support (Hindi, regional languages)
- WhatsApp / Telegram bot integration
- Email/SMS notifications to registered participants
- Role-based admin access (multiple admin users with permissions)
- Persistent analytics with historical charts
- Mobile app (iOS / Android)
- Integration with NAO 2026 registration portal

---

## 12. Conclusion

NaoBot provides NAO 2026 with a production-ready, intelligent support system that reduces manual workload, improves participant experience, and gives the organizing team complete visibility and control over every interaction. The system is live, tested, and ready for deployment.

---

*National Automobile Olympiad 2026 — Powered by NaoBot*
*Built with Next.js · PostgreSQL · OpenAI*
