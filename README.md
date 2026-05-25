# CabRush ⚡

Personal automation tool that books cabs simultaneously across **Uber**, **Ola**, and **Rapido** — whichever confirms first wins, the others are cancelled.

> **Ranchi Only** — location autocomplete is biased to Ranchi, Jharkhand.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- Credentials already configured in root `.env` (do not commit this file)

## Project Structure

```
CABRUSH/
├── .env              # Credentials (already configured)
├── client/           # React + Vite frontend
├── server/           # Express + Playwright backend
└── README.md
```

## Setup

### 1. Install server dependencies

```bash
cd server
npm install
npx playwright install chromium
```

### 2. Install client dependencies

```bash
cd ../client
npm install
```

## Running the App

Open **two terminals**:

### Terminal 1 — Backend (from `server/`)

```bash
cd server
npm start
```

Server runs at **http://localhost:5000**

### Terminal 2 — Frontend (from `client/`)

```bash
cd client
npm run dev
```

App opens at **http://localhost:5173**

## Usage

1. Open http://localhost:5173
2. Enter pickup and drop locations (Google Maps autocomplete, Ranchi-biased)
3. Click **Find Cab**
4. Watch live status cards for Uber, Ola, and Rapido
5. When one confirms, confetti fires and the others are auto-cancelled
6. View past bookings on the **History** page (stored in browser localStorage)

## OTP Handling

Playwright runs in **non-headless** mode (`HEADLESS=false`) so you can see the browser windows. When a platform shows an OTP screen, automation pauses for **30 seconds** — enter the OTP manually in the browser window.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/config` | Google Maps API key for frontend |
| POST | `/api/book` | Start parallel booking `{ pickup, drop, sessionId }` |
| GET | `/api/status/:sessionId` | SSE stream for live status updates |
| GET | `/api/bookings` | Server-side booking history (`bookings.json`) |

## Environment Variables

Read from root `.env` (already filled in):

| Variable | Description |
|----------|-------------|
| `GOOGLE_MAPS_API_KEY` | Google Maps Places autocomplete |
| `UBER_EMAIL` / `UBER_PASSWORD` | Uber login |
| `OLA_PHONE` / `OLA_PASSWORD` | Ola login |
| `RAPIDO_PHONE` | Rapido login |
| `PORT` | Server port (default 5000) |
| `HEADLESS` | `false` = visible browsers for debugging |

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Hot Toast, Google Maps JS API, Axios, EventSource (SSE)

**Backend:** Node.js, Express, Playwright, dotenv, cors, Server-Sent Events

## Notes

- Platform UIs change frequently — automation scripts use fallback selectors
- This is a personal automation tool; use responsibly and in compliance with each platform's terms of service
- Booking history is saved both server-side (`server/bookings.json`) and client-side (`localStorage`)
