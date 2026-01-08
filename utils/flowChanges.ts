/**
 * Flow Changes Detection Utilities
 * Helper functions to detect changes and determine Flow state
 */

import { Flow } from '@/data/flows';

/**
 * CANONICAL: Detect if a Flow has unsaved changes compared to saved version
 * Compares modifiable properties: spots, title, description, movementMode
 */
export function hasFlowChanges(flow: Flow, savedFlow: Flow | null): boolean {
  // If no saved flow exists, consider it as having changes (is a draft)
  if (!savedFlow) {
    return true;
  }

  // Compare spots (order matters)
  const spotsChanged = JSON.stringify(flow.spots) !== JSON.stringify(savedFlow.spots);
  if (spotsChanged) {
    return true;
  }

  // Compare title
  const titleChanged = flow.title !== savedFlow.title;
  if (titleChanged) {
    return true;
  }

  // Compare description (handle undefined/null)
  const flowDescription = flow.description || '';
  const savedDescription = savedFlow.description || '';
  const descriptionChanged = flowDescription !== savedDescription;
  if (descriptionChanged) {
    return true;
  }

  // Compare movementMode
  const movementModeChanged = flow.movementMode !== savedFlow.movementMode;
  if (movementModeChanged) {
    return true;
  }

  // No changes detected
  return false;
}

/**
 * CANONICAL: Determine Flow state based on saved status and changes
 * States:
 * - 'draft': Flow never saved (not in savedFlows)
 * - 'saved': Flow already saved (in savedFlows) with no changes
 * - 'edited': Flow previously saved but with pending changes
 */
export function getFlowState(
  flow: Flow,
  isSaved: boolean,
  hasChanges: boolean
): 'draft' | 'saved' | 'edited' {
  if (!isSaved) {
    return 'draft';
  }

  if (hasChanges) {
    return 'edited';
  }

  return 'saved';
}
