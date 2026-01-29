import type { AiCoverageSessionRecord } from '@/types/aiCoverage';
import { isAiCoverageCooldownActive } from '@/utils/aiCoverageService';

const LOW_COVERAGE_THRESHOLD = 3;

export function isLowCoverage(spotCount: number): boolean {
  return spotCount < LOW_COVERAGE_THRESHOLD;
}

export function shouldTriggerAiCoverage(params: {
  spotCount: number;
  latestSession: AiCoverageSessionRecord | null;
}): boolean {
  if (!isLowCoverage(params.spotCount)) {
    return false;
  }
  if (isAiCoverageCooldownActive(params.latestSession)) {
    return false;
  }
  return true;
}

/** Razón por la que no se puede generar (para mensaje al usuario). */
export function getAiCoverageBlockReason(params: {
  spotCount: number;
  latestSession: AiCoverageSessionRecord | null;
}): 'coverage' | 'cooldown' | null {
  if (!isLowCoverage(params.spotCount)) return 'coverage';
  if (isAiCoverageCooldownActive(params.latestSession)) return 'cooldown';
  return null;
}
