const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Dev-only proxy to avoid CORS issues when hitting the remote API from localhost.
 * Proxies /api/* requests to the QA endpoint host.
 * This file is only used by the CRA dev server (npm start), not in production builds.
 */
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://qa.access-ci.org',
      changeOrigin: true,
    })
  );
};
