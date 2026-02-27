

# Fix: React Error #310 on /eventos page

## Root Cause Analysis

React error #310 means "Objects are not valid as a React child." After investigation, the most probable causes are:

1. **Stale persisted cache**: The app uses `PersistQueryClientProvider` with localStorage (`gercao-cache` key). Previously corrupted or stale data from before the 403 fixes may be restored and rendered as objects instead of strings.

2. **Missing data guards**: Some components render query data without null-safe checks that could result in objects being passed where strings are expected (e.g., Supabase error objects or raw DB objects).

## Changes

### 1. Add cache version bust in AppProviders

Add a `buster` option to the persister configuration so old cache data from before the fixes is automatically discarded. This ensures stale/corrupt data doesn't cause render errors.

**File:** `src/providers/AppProviders.tsx`
- Add `buster: 'v2'` to `persistOptions` so old cached data is invalidated

### 2. Add defensive rendering in EventosStats

Add guards so that if `eventos` contains unexpected shapes from cache, the component won't crash.

**File:** `src/components/eventos/EventosStats.tsx`
- Wrap stat values with `String()` to ensure they're always renderable

### 3. Add defensive rendering in Dashboard stats

The Dashboard queries `vw_eventos_stats` and `vw_demandas_stats`. If these return unexpected data shapes from cache, rendering could fail.

**File:** `src/pages/Dashboard.tsx`
- Ensure all stat values passed to `StatCard` are explicitly converted to strings

### 4. Add error handling for vw stats queries in useDashboardStats

**File:** `src/hooks/useDashboardStats.ts`
- Add null checks when processing `eventosStats` and `demandasStats` arrays
- Default to safe values (0) if data is missing or malformed

## Why this should fix it

- Busting the cache version forces a fresh fetch with the new GRANT permissions
- Defensive string conversions prevent objects from being passed as React children
- The underlying 403 issue is already fixed by the previous migration

