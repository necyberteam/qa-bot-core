/**
 * Flow Settings Utilities
 *
 * Provides utilities for processing flow configurations to handle
 * common patterns and work around react-chatbotify quirks.
 */

import type { Flow } from 'react-chatbotify';

export interface FlowSettingsOptions {
  /**
   * Automatically set chatDisabled based on step type:
   * - Steps with options/checkboxes → chatDisabled: true
   * - Steps without → chatDisabled: false
   *
   * Only applies to steps that don't already have chatDisabled explicitly set.
   *
   * This works around a react-chatbotify quirk where chatDisabled state
   * persists across step transitions instead of falling back to settings.
   */
  disableOnOptions?: boolean;
}

/**
 * Apply settings/transformations to a flow object.
 *
 * @param flow - The flow configuration to process
 * @param options - Settings to apply
 * @returns A new flow object with settings applied
 *
 * @example
 * ```typescript
 * const processedFlow = applyFlowSettings(myFlow, {
 *   disableOnOptions: true
 * });
 * ```
 */
export function applyFlowSettings(
  flow: Flow,
  options: FlowSettingsOptions
): Flow {
  if (!options || Object.keys(options).length === 0) {
    return flow;
  }

  const processed: Flow = {};

  for (const [stepName, step] of Object.entries(flow)) {
    let processedStep = { ...step };

    // Apply disableOnOptions if enabled
    if (options.disableOnOptions && processedStep.chatDisabled === undefined) {
      const hasOptions = !!(processedStep.options || processedStep.checkboxes);
      processedStep.chatDisabled = hasOptions;
    }

    processed[stepName] = processedStep;
  }

  return processed;
}







