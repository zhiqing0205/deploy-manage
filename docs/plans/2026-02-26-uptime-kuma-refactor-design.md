# Uptime Kuma Integration Refactor

## Goal

Refactor status monitoring integration to properly connect with Uptime Kuma, displaying real-time heartbeat status alongside services in the app list.

## Environment Variables

Replace single `STATUS_API_URL` with:
- `UPTIME_URL` — base URL (e.g. `https://status.ziuch.com`)
- `UPTIME_PAGE` — page slug (e.g. `page`)

API endpoints constructed as:
- Status page: `${UPTIME_URL}/api/status-page/${UPTIME_PAGE}`
- Heartbeat: `${UPTIME_URL}/api/status-page/heartbeat/${UPTIME_PAGE}`

## Data Layer

### `src/lib/api/status.ts`

Two functions:
1. `fetchStatusMonitors()` — returns monitor list with id, name, group, type
2. `fetchHeartbeats()` — returns `Map<number, Heartbeat[]>` keyed by monitorId

Heartbeat entry: `{ status: number, time: string, ping: number | null }`

## Frontend

### Service Cards (integrated in `/services` page)

Each card with a `monitorId` shows:
- Heartbeat bar: horizontal strip of colored blocks (green=up, red=down, gray=no data)
- Uptime percentage and average latency
- Tooltip on hover showing specific time and ping

### New Component: `HeartbeatBar`

Client component with tooltip support for individual heartbeat blocks.

## File Changes

| File | Change |
|------|--------|
| `src/lib/env.ts` | Replace `STATUS_API_URL` with `UPTIME_URL` + `UPTIME_PAGE` |
| `.env.example` | Update example values |
| `src/lib/api/status.ts` | Rewrite with new URL construction + heartbeat API |
| `src/app/(app)/services/page.tsx` | Integrate heartbeat data into service cards |
| `src/app/actions/sync.ts` | Adapt to new status API |
| `src/components/HeartbeatBar.tsx` | New: heartbeat visualization component |
