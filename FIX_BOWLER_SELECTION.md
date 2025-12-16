# Fix: Bowler Selection Modal Not Appearing

## Problem
When an over was completed, the application was failing to prompt for the selection of a new bowler. The match continued as if the over hadn't ended (or simply allowed scoring to continue).

## Root Cause
The logic for detecting the end of an over relied on floating-point arithmetic on the `overs` counter (e.g., checking if `0.5` + 1 ball becomes `1.0`). In some cases, or due to logic flow overrides, the `overCompleted` flag might not have been setting correctly, or the `playStatus` of the match was not being updated to `'waiting_for_bowler'`.

Additionally, the `isOversDone` check (checking if the *entire innings* is over) might have been prematurely overriding the `waiting_for_bowler` status in edge cases where the over count was incremented before the check.

## Solution Implemented

### 1. Robust Over Calculation
Refactored the `recordBall` function in `context/TournamentContext.tsx` to use integer-based ball counting for determining over completion.
- Calculates `currentBalls = Math.round(overs) * 6 + ballsInCurrentOver`.
- Explicitly checks if the current ball is the 6th valid ball of the over.
- Sets `overCompleted = true` reliably.

### 2. State Management Fix
- Explicitly sets `match.playStatus = 'waiting_for_bowler'` when `overCompleted` is true.
- Ensures this status update is not overridden unless the *entire innings* is completed (all overs bowled or all wickets down).
- Persists this status to Supabase properly.

### 3. Code Organization
- Fixed a circular dependency/hoisting issue by moving helper functions (`endMatchLogic`, `getTeamName`, `updateTeamStats`) before they are called in `recordBall`.

## Verification
- **Scenario**: Score a single runs or dot balls until the over reaches 0.5 (5 balls).
- **Action**: Score one more valid ball.
- **Expected Result**: 
    - Over count updates to next integer (e.g., 1.0).
    - Match status updates to `waiting_for_bowler`.
    - **Scorer UI** detects this status and displays the "Select Bowler" modal.
    - Scoring controls are blocked/underneath the modal until a bowler is selected.

This ensures the user MUST select a valid bowler before the next over can commence.
