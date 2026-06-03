# qa-bot-core

The core chatbot UI component (published as `@snf/qa-bot-core`): a pre-configured React wrapper
around react-chatbotify providing the end-user chat interface, rating/feedback, and GA4 analytics.

## Where this sits

Bottom of the frontend chain: **`qa-bot-core` → `access-qa-bot` → `access-ci-ui` → Drupal pin**.
Talks to `access-agent` (queries) and `access-serverless-api` (auxiliary functions). The full
publish/deploy chain and local-test workflow are in `access-ci/DRUPAL_TESTING.md`.

## Run / build

```bash
npm install
npm start            # demo app at localhost:3000
npm run build:lib    # build the publishable library
npm test
```

## Conventions & gotchas

- **Styles are a separate import** — `import '@snf/qa-bot-core/styles'`; they are not auto-injected
  (shadow-DOM consumers need the standalone stylesheet).
- The host gates Q&A access via the **`isLoggedIn`** prop; login state is controlled by the parent.
- Ships in three formats (ESM, CJS, UMD); a standalone UMD bundle is at
  `dist/qa-bot-core.standalone.js` for non-React usage.

## Key paths

`src/` (React source) · `dist/` (built outputs) · `rollup.config.mjs` (bundle config).
