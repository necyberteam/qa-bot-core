/**
 * Standalone build entry point for QA Bot Core
 *
 * This creates a standalone UMD bundle that includes React (via Preact).
 * Used when loading the bot via script tag in vanilla HTML/JS environments.
 */

import qaBot from './lib';
import { logger } from './utils/logger';

// Log version on standalone load (controlled by QA_BOT_SHOW_VERSION localStorage)
logger.version('0.2.3');

// Re-export the programmatic API as the default export
export default qaBot;

