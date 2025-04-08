// metrics.js
const express = require('express');
const client = require('prom-client');

const router = express.Router();
const collectDefaultMetrics = client.collectDefaultMetrics;

// Start collecting default system metrics
collectDefaultMetrics();

// Expose /metrics endpoint
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

module.exports = router;
