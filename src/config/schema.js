/**
 * QA Bot Configuration Schema
 *
 * This is the SINGLE SOURCE OF TRUTH for all configurable options.
 * No defaults should be defined anywhere else in the codebase.
 */

/**
 * Complete configuration schema with defaults, types, and metadata
 */
export const configSchema = {
  // Core functionality - required for bot operation
  core: {
    endpoints: {
      qa: {
        type: 'string',
        required: false, // Allow demo mode without endpoint
        default: '',
        description: 'Q&A API endpoint URL'
      },
      rating: {
        type: 'string',
        required: false,
        description: 'Optional rating/feedback endpoint URL'
      }
    },
    auth: {
      apiKey: {
        type: 'string',
        required: false,
        propOverride: true,
        description: 'API key for authentication'
      }
    }
  },

  // UI behavior and state management
  ui: {
    display: {
      embedded: {
        type: 'boolean',
        default: false,
        propOverride: true,
        description: 'Whether to embed in page vs show as floating chat'
      },
      enabled: {
        type: 'boolean',
        default: true,
        propOverride: true,
        description: 'Whether the bot is enabled and available'
      },
      defaultOpen: {
        type: 'boolean',
        default: false,
        propOverride: true,
        description: 'Whether chat starts open (for programmatic API)'
      }
    },
    state: {
      open: {
        type: 'boolean',
        default: false,
        propOverride: true,
        description: 'Whether chat is open (controlled mode)'
      },
      onOpenChange: {
        type: 'function',
        propOverride: true,
        description: 'Callback when open state changes'
      }
    }
  },

  // User context and personalization
  user: {
    email: {
      type: 'string',
      propOverride: true,
      description: 'Current user email for personalization'
    },
    name: {
      type: 'string',
      propOverride: true,
      description: 'Current user name for personalization'
    },
    loginUrl: {
      type: 'string',
      propOverride: true,
      description: 'URL to redirect for login/authentication'
    }
  },

  // Content and messaging
  content: {
    messages: {
      welcome: {
        type: 'string',
        default: 'Hello! What can I help you with?',
        propOverride: true,
        description: 'Initial greeting message'
      },
      placeholder: {
        type: 'string',
        default: 'Type your question here...',
        description: 'Input placeholder text'
      },
      tooltip: {
        type: 'string',
        default: 'Ask me a question!',
        description: 'Tooltip text for chat button'
      },
      error: {
        type: 'string',
        default: 'Unable to process your request. Please try again.',
        description: 'Generic error message'
      },
      disabled: {
        type: 'string',
        default: 'Chat is currently unavailable',
        description: 'Message when bot is disabled'
      }
    },
    branding: {
      title: {
        type: 'string',
        default: 'Q&A Bot',
        description: 'Bot title in header'
      },
      avatarUrl: {
        type: 'string',
        default: '',
        description: 'Bot avatar image URL'
      }
    }
  },

  // Visual appearance and theming
  appearance: {
    theme: {
      primaryColor: {
        type: 'string',
        default: '#1a5b6e',
        cssVariable: '--primary-color',
        description: 'Primary brand color'
      },
      secondaryColor: {
        type: 'string',
        default: '#107180',
        cssVariable: '--secondary-color',
        description: 'Secondary accent color'
      },
      fontFamily: {
        type: 'string',
        default: 'Arial, sans-serif',
        cssVariable: '--font-family',
        description: 'Font family for text'
      }
    },
    customization: {
      headerComponents: {
        type: 'array',
        default: null,
        propOverride: true,
        description: 'Custom React components for header'
      }
    }
  },

  // Bot behavior and features
  behavior: {
    chat: {
      streamSpeed: {
        type: 'number',
        default: 10,
        description: 'Message streaming speed (ms per character)'
      },
      characterLimit: {
        type: 'number',
        default: 1000,
        description: 'Maximum characters per message'
      },
      showRatings: {
        type: 'boolean',
        default: true,
        description: 'Whether to show thumbs up/down ratings'
      }
    },
    flows: {
      customFlows: {
        type: 'object',
        default: null,
        propOverride: true,
        description: 'Custom conversation flow definitions'
      }
    }
  }
};

/**
 * Extract all default values from the schema into a flat configuration object
 * This replaces the old DEFAULT_CONFIG completely
 */
function extractDefaults(schema, result = {}, path = '') {
  for (const [key, value] of Object.entries(schema)) {
    if (value.hasOwnProperty('default')) {
      // This is a config value with a default - set it on the result object
      setNestedPath(result, path + key, value.default);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // This is a nested section - recurse deeper
      extractDefaults(value, result, path + key + '.');
    }
  }
  return result;
}

/**
 * Set a nested path on an object (e.g., 'content.messages.welcome')
 */
function setNestedPath(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Extract list of props that can override config values
 */
function extractPropOverrides(schema, result = []) {
  for (const [key, value] of Object.entries(schema)) {
    if (value.propOverride === true) {
      result.push(key);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      extractPropOverrides(value, result);
    }
  }
  return result;
}

/**
 * The default configuration object - generated from schema
 * This is the single source of truth for all default values
 */
export const defaultConfig = extractDefaults(configSchema);

/**
 * List of props that can override config values
 * Used for prop validation and merging
 */
export const propOverrides = extractPropOverrides(configSchema);

import { deepMerge } from '../utils/deep-merge';

/**
 * Merge configuration with 3-layer precedence (optimized for wrapper pattern):
 * 1. Schema defaults (lowest priority)
 * 2. User config object (middle priority - includes wrapper defaults)
 * 3. Prop overrides (highest priority - runtime props)
 *
 * Note: Wrappers should merge their defaults into userConfig before calling this.
 * Example: mergeConfig({...WRAPPER_DEFAULTS, ...props.config}, propOverrides)
 *
 * @param {Object} userConfig - User-provided config object (may include wrapper defaults)
 * @param {Object} propOverrides - Props that can override config
 * @returns {Object} Final merged configuration
 */
export function mergeConfig(userConfig = {}, propOverrides = {}) {
  // Deep merge with proper nested object handling
  const merged = deepMerge(defaultConfig, userConfig);

  // Apply prop overrides with correct nesting
  for (const [key, value] of Object.entries(propOverrides)) {
    if (value !== undefined) {
      // Map prop names to their correct nested locations
      const configPath = getConfigPathForProp(key);
      if (configPath) {
        setNestedPath(merged, configPath, value);
      }
    }
  }

  return merged;
}

/**
 * Map prop names to their nested config paths
 * This handles the mapping between flat prop names and nested config structure
 */
function getConfigPathForProp(propName) {
  const propMappings = {
    // Auth props
    apiKey: 'core.auth.apiKey',
    userEmail: 'user.email',
    userName: 'user.name',
    loginUrl: 'user.loginUrl',

    // UI props
    embedded: 'ui.display.embedded',
    enabled: 'ui.display.enabled',
    open: 'ui.state.open',
    onOpenChange: 'ui.state.onOpenChange',
    defaultOpen: 'ui.display.defaultOpen',

    // Content props
    welcome: 'content.messages.welcome',

    // Appearance props
    headerComponents: 'appearance.customization.headerComponents',

    // Behavior props
    customFlows: 'behavior.flows.customFlows'
  };

  return propMappings[propName];
}
