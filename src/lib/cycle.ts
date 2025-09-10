// 28-day cycle service with Liverpool server time
import { CycleInfo } from '@/types/invoice';

// Anchor date for cycle calculations (prototype)
const CYCLE_ANCHOR = new Date('2024-01-01T00:00:00Z');
const CYCLE_LENGTH_DAYS = 28;

export const getServerNow = (): Date => {
  // In production, this would use server time from Liverpool
  // For prototype, use local time
  return new Date();
};

export const getCurrentCycle = (): CycleInfo => {
  const now = getServerNow();
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

export const isReadOnly = (): boolean => {
  const now = getServerNow();
  const cycle = getCurrentCycle();
  return now >= cycle.cutoffAt;
};

export const isConsentWindow = (): boolean => {
  const cycle = getCurrentCycle();
  const now = getServerNow();
  
  // Consent window: Day 27 (00:00) to Day 28 (23:59:59)
  const consentStart = new Date(cycle.start.getTime() + 26 * 24 * 60 * 60 * 1000); // Day 27
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