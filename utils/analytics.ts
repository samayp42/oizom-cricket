import { BallEvent, Player } from '../types';

export const generateCommentary = (
  ball: BallEvent,
  bowler: Player | undefined,
  batter: Player | undefined,
  isFreeHit: boolean
): string => {
  const bowlerName = bowler?.name.split(' ').pop() || 'Bowler';
  const batterName = batter?.name.split(' ').pop() || 'Batter';
  const overStr = `${ball.overNumber}.${ball.ballInOver}`;
  
  let action = '';

  if (ball.isWicket) {
    if (ball.wicketType === 'bowled') action = 'BOWLED HIM! Cleaned up!';
    else if (ball.wicketType === 'caught') action = 'CAUGHT! Straight to the fielder.';
    else if (ball.wicketType === 'run-out') action = 'RUN OUT! What a disaster between the wickets.';
    else action = 'OUT!';
    return `${overStr} - ${bowlerName} to ${batterName}, ${action}`;
  }

  if (ball.extraType === 'wide') return `${overStr} - ${bowlerName} to ${batterName}, WIDE ball.`;
  if (ball.extraType === 'no-ball') return `${overStr} - ${bowlerName} to ${batterName}, NO BALL! Free hit coming up.`;
  
  if (ball.runsScored === 6) action = 'SIX! That is huge! Out of the park!';
  else if (ball.runsScored === 4) action = 'FOUR! Glorious shot through the gap.';
  else if (ball.runsScored === 0) action = 'no run, solid defense.';
  else if (ball.runsScored === 1) action = '1 run, rotates the strike.';
  else if (ball.runsScored === 2) action = '2 runs, good running.';
  else action = `${ball.runsScored} runs.`;

  const freeHitPrefix = isFreeHit ? "FREE HIT: " : "";

  return `${overStr} - ${freeHitPrefix}${bowlerName} to ${batterName}, ${action}`;
};