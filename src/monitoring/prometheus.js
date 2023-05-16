const express = require('express');
const {collectDefaultMetrics, Counter, Registry, Summary} = require('prom-client');
const cors = require('cors')


const app = express();
const registry = new Registry();

app.use(cors())

// Collect default metrics
collectDefaultMetrics({register: registry});

// Define a Prometheus counter for the total number of requests
const requestsCounter = new Counter({
  name: 'review_app_requests_total',
  help: 'Total number of requests to the Review app',
  registers: [registry],
});

// Define a Prometheus summary for response time
const requestTimeSummary = new Summary({
  name: 'request_processing_seconds',
  help: 'Time spent processing a review request',
  registers: [registry],
});


// Register the total number of requests metric endpoint
app.post('/total-req', async (req, res) => {
  try {
    requestsCounter.inc(1);
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// Register the average request time endpoint
app.post('/review-average-processing/:number', (req, res) => {

  try {
    // Extract the number parameter and convert it to an integer
    const number = parseInt(req.params.number);
    requestTimeSummary.observe(number / 1000)
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
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
