const express = require('express');
const {collectDefaultMetrics, Counter, Registry} = require('prom-client');

const app = express();
const registry = new Registry();

// Collect default metrics
collectDefaultMetrics({register: registry});

// Define a Prometheus counter
const requestsCounter = new Counter({
  name: 'review_app_requests_total',
  help: 'Total number of requests to the Review app',
  registers: [registry],
});

// Register the Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await registry.metrics();
    res.set('Content-Type', registry.contentType);
    res.send(metrics);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// Start the HTTP server
const port = 3001;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Export the Prometheus registry and server
module.exports = {registry, server, requestsCounter};
