# QA Bot Core - File Guide

This document provides an organized overview of the key files in the QA Bot Core application, grouped by their role and listed roughly in order of execution/dependency flow.

## 📋 Table of Contents
- [Configuration & Schema](#configuration--schema)
- [Core Components](#core-components)
- [React Hooks](#react-hooks)
- [Utility Functions](#utility-functions)
- [Styles](#styles)
- [Application Entry Points](#application-entry-points)
- [Build Configuration](#build-configuration)

---

## Configuration & Schema

### `/src/config/schema.js`
**Purpose**: Unified configuration schema - the SINGLE SOURCE OF TRUTH for all defaults
- Complete configuration schema with logical groupings (core, ui, user, content, appearance, behavior)
- All default values centralized with type definitions and descriptions
- Supports 3-layer precedence: schema defaults → user config → prop overrides
- Deep merging for nested configuration objects
- Optimized for wrapper pattern support
- Prop override mappings for clean API

### `/src/utils/deep-merge.js`
**Purpose**: Deep merge utility for nested configuration objects
- Handles proper merging of nested objects while preserving arrays
- Used by configuration system to merge wrapper defaults, user config, and prop overrides
- Prevents loss of nested properties during config merging
- Essential for wrapper pattern support

---

## Core Components

### `/src/components/QABot.js`
**Purpose**: Main Q&A Bot React component - the heart of the application
- Uses unified configuration schema with 3-layer precedence (defaults → config → props)
- Manages session state and generation
- Integrates with react-chatbotify ChatBot component
- Handles theme configuration via hooks and schema
- Manages chat open/close state through configuration
- Renders complete chat interface with accessibility features
- Coordinates with BotController for imperative API access
- Supports wrapper pattern for organizational customization

### `/src/components/BotController.js`
**Purpose**: Bridge between react-chatbotify hooks and imperative API
- Must be rendered inside ChatBotProvider to access hooks
- Exposes imperative methods like `addMessage()`
- Manages chat window state synchronization
- Handles user interaction state tracking
- Provides the ref-based API for external control

---

## React Hooks

### `/src/hooks/useChatBotSettings.js`
**Purpose**: Generates complete ChatBot configuration object
- Uses schema defaults instead of hardcoded values
- Takes theme colors, embedded mode, login settings as input
- Returns comprehensive settings object for react-chatbotify
- Configures accessibility features, input handling, and UI elements
- Sets up footer buttons and header components
- All defaults now sourced from unified configuration schema

### `/src/hooks/useThemeColors.js`
**Purpose**: Extracts theme colors from CSS custom properties
- Reads CSS variables (`--primary-color`, `--secondary-color`, `--font-family`)
- Falls back to schema-provided theme configuration
- Supports dynamic theming through CSS variable changes
- No longer depends on scattered constants

### `/src/hooks/useFocusableSendButton.js`
**Purpose**: Enhances accessibility of the send button
- Makes send button keyboard focusable (adds tabindex)
- Adds keyboard event handlers (Enter/Space key support)
- Periodically checks and updates send button accessibility
- Works around react-chatbotify limitations for keyboard users

### `/src/hooks/useKeyboardNavigation.js`
**Purpose**: Comprehensive keyboard navigation system for chat options
- Handles arrow key navigation through chat options and checkboxes
- Supports Enter/Space selection, Home/End navigation
- Auto-focuses new options when they appear
- Provides screen reader announcements
- Includes navigation hints for users

---

## Utility Functions

### `/src/utils/create-bot-flow.js`
**Purpose**: Factory function that creates the complete conversation flow
- Combines base Q&A flow with optional custom flows
- Handles flow merging and start point configuration
- Takes config, customFlows, and sessionId as parameters

### `/src/utils/flows/qa-flow.js`
**Purpose**: Implements the core Q&A conversation logic
- Handles question processing and API calls
- Manages feedback/rating system (thumbs up/down)
- Processes API responses and error handling
- Integrates with session tracking and query IDs
- Supports demo mode with sample responses when no endpoint configured
- Graceful fallback for development and testing scenarios

### `/src/utils/getProcessedText.js`
**Purpose**: Text processing utility for API responses
- Converts bare URLs to markdown links automatically
- Preserves existing markdown and HTML links
- Handles trailing punctuation correctly
- Ensures clickable links in bot responses

### `/src/utils/error-handler.js`
**Purpose**: Centralized error handling for bot operations
- Simplified to use schema-based error messages
- Returns user-friendly error messages from configuration
- Logs errors for debugging while showing safe messages to users
- No longer contains scattered error message definitions

### `/src/utils/validation-utils.js`
**Purpose**: Input validation utilities, primarily for email handling
- Provides comprehensive email validation regex
- Returns structured validation results for chat flows
- Includes user-friendly error messages and highlighting

---

## Styles

### `/src/styles/index.css`
**Purpose**: Complete stylesheet for the QA Bot component
- React ChatBotify component overrides and customizations
- Responsive design for mobile/tablet/desktop
- Accessibility enhancements (focus styles, screen reader utilities)
- Keyboard navigation visual feedback
- Checkbox and option styling
- Animation and interaction effects

---

## Application Entry Points

### `/src/App.js`
**Purpose**: Simple wrapper component for the JavaScript API
- Forwards all props to QABot component
- Used by the programmatic `qaBot()` function
- Minimal wrapper that maintains ref forwarding

### `/src/index.js`
**Purpose**: React development and demo entry point
- Creates a demo application with controls
- Shows example usage of QABot component with dynamic props
- Used when running `npm start` for development
- Demonstrates state management, user context, and imperative API

### `/src/lib.js`
**Purpose**: Main library export file - the public API
- Exports QABot component for React usage
- Implements `qaBot()` function for vanilla JavaScript usage
- Creates ProgrammaticQABot wrapper with imperative methods
- Handles React root creation and component lifecycle

### `/src/standalone.js`
**Purpose**: Standalone build entry point
- Simple re-export of qaBot function from lib.js
- Used by rollup to create the standalone UMD bundle
- Entry point for users who want to include the bot via script tag

---

## Build Configuration

### `/config-overrides.js`
**Purpose**: Webpack configuration overrides for Create React App
- Removes hash from built filenames for predictable output
- Adjusts CSS and JS output naming patterns
- Used by react-scripts with customize-cra

### `/rollup.config.mjs`
**Purpose**: Rollup build configuration for library distribution
- Creates multiple build targets (ESM, CJS, UMD)
- ESM/CJS builds for React usage (peer dependencies external)
- UMD standalone build with React bundled (uses Preact for size)
- Handles CSS processing, Babel transformation, and minification
- Produces files in `/dist/` for npm distribution

---

## Runtime Flow

1. **Configuration Merging**: Schema defaults merged with user config and prop overrides using deep merge
2. **Component Mounting**: QABot renders with unified configuration, hooks initialize
3. **Theme Resolution**: CSS variables checked, fallback to configuration theme values
4. **Flow Creation**: Bot conversation flow constructed via create-bot-flow with config and custom flows
5. **User Interaction**: Keyboard navigation and accessibility hooks activate
6. **Q&A Processing**: Messages flow through qa-flow (with demo mode support), text processing, error handling
7. **State Management**: BotController syncs state between hooks and external API

## Wrapper Pattern Support

- **Deep Configuration Merging**: Nested config properties merge properly without losing defaults
- **3-Layer Precedence**: Schema defaults → User config (including wrapper defaults) → Prop overrides
- **Custom Flow Injection**: Wrappers can completely replace or extend conversation flows
- **Component Slot System**: Support for custom header components (extensible architecture)
- **State Management Freedom**: Wrappers can add React contexts and providers without restrictions
- **All Consumption Methods**: React component, JavaScript API, and standalone builds all wrapper-friendly

## Build Flow

1. **Development**: `index.js` → React development server
2. **Library Build**: `rollup.config.mjs` processes `lib.js` → ESM/CJS outputs
3. **Standalone Build**: `rollup.config.mjs` processes `standalone.js` → UMD bundle
4. **React App Build**: `config-overrides.js` customizes webpack → `/build/` directory
