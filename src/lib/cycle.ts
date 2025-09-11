// 28-day cycle service with Liverpool server time
import { CycleInfo } from '@/types/invoice';

// Anchor date for cycle calculations (prototype)
const CYCLE_ANCHOR = new Date('2024-01-01T00:00:00Z');
const CYCLE_LENGTH_DAYS = 28;

export const getServerNow = (): Date => {
  // In production, this would use server time from Liverpool
  // For prototype, freeze on day 25 of 28
  const cycle = getCurrentCycleInternal();
  return new Date(cycle.start.getTime() + 24 * 24 * 60 * 60 * 1000); // Day 25 (0-indexed)
};

const getCurrentCycleInternal = (): CycleInfo => {
  const now = new Date(); // Use real time for cycle calculation
  const timeSinceAnchor = now.getTime() - CYCLE_ANCHOR.getTime();
  const daysSinceAnchor = Math.floor(timeSinceAnchor / (1000 * 60 * 60 * 24));
  const currentCycleNumber = Math.floor(daysSinceAnchor / CYCLE_LENGTH_DAYS);
  
  const cycleStartDays = currentCycleNumber * CYCLE_LENGTH_DAYS;
  const cycleEndDays = cycleStartDays + CYCLE_LENGTH_DAYS;
  
  const start = new Date(CYCLE_ANCHOR.getTime() + cycleStartDays * 24 * 60 * 60 * 1000);
  const end = new Date(CYCLE_ANCHOR.getTime() + cycleEndDays * 24 * 60 * 60 * 1000);
  
  const dayIndex = daysSinceAnchor - cycleStartDays;
  const daysRemaining = CYCLE_LENGTH_DAYS - dayIndex;
  
  return {
    start,
    end,
    dayIndex,
    daysRemaining,
    cutoffAt: end
  };
};

export const getCurrentCycle = (): CycleInfo => {
  // For prototype, return fixed day 25 values
  const realCycle = getCurrentCycleInternal();
  
  return {
    start: realCycle.start,
    end: realCycle.end,
    dayIndex: 24, // Day 25 (0-indexed)
    daysRemaining: 3, // Days 26, 27, 28 remaining
    cutoffAt: realCycle.cutoffAt
  };
};

export const isReadOnly = (): boolean => {
  const now = getServerNow();
  const cycle = getCurrentCycle();
  return now >= cycle.cutoffAt;
};

export const isConsentWindow = (): boolean => {
  const cycle = getCurrentCycle();
  const now = getServerNow();
  
  // Consent window: Day 22 (00:00) to Day 28 (23:59:59)
  const consentStart = new Date(cycle.start.getTime() + 21 * 24 * 60 * 60 * 1000); // Day 22
  const consentEnd = cycle.cutoffAt; // End of Day 28
  
  return now >= consentStart && now < consentEnd;
};

export const formatLocalCutoff = (cutoffAt: Date): string => {
  return cutoffAt.toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};