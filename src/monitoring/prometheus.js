const express = require('express');
const {collectDefaultMetrics, Counter, Registry, Summary, Histogram, Gauge} = require('prom-client');
const cors = require('cors')
const bodyParser = require('body-parser');

const app = express();
const registry = new Registry();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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

// Accuracy for predictions
// Define a Prometheus histogram for the review ratings
const reviewRatingHistogram = new Histogram({
  name: 'review_rating',
  help: 'Distribution of review ratings',
  buckets: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  labelNames: ['rating'],
  registers: [registry]
});

// Define a gauge to track the accuracy rate of rating predictions
const accuracyGauge = new Gauge({
  name: 'review_prediction_accuracy',
  help: 'Accuracy rate of rating predictions',
  registers: [registry]
});

// Define a histogram that stores the total number of requests, correct reviews and incorrect reviews
// bucket 1 - correct reviews
// bucket 2 - incorrect reviews
// bucket 3 - total no of reviews
const reviewAccuracyHistogram = new Histogram({
  name: 'review_correctness_distribution',
  help: 'Distribution of review ratings by correctness',
  labelNames: ['result'],
  registers: [registry]
});

// Process each review and increment the corresponding bucket of the histogram
function processReview(review) {
  const assessedRating = assesRating(review.user_predict).toUpperCase();
  const actualRating = review.predicted.toUpperCase();

  reviewRatingHistogram.observe(review.user_predict);

  if (assessedRating === actualRating) {
    reviewAccuracyHistogram.labels({result: 'Correct_Reviews'}).observe(1);
  } else if (assessedRating !== 'NEUTRAL') {
    reviewAccuracyHistogram.labels({result: 'Incorrect_Reviews'}).observe(1);
  } else {
    reviewAccuracyHistogram.labels({result: 'Inconclusive_Reviews'}).observe(1);
  }

  reviewAccuracyHistogram.labels({result: 'Total_Reviews'}).observe(1);
}

// Assess Rating
function assesRating(review) {
  return review === 2.5 ? 'NEUTRAL' : review > 2.5 ? 'POSITIVE' : 'NEGATIVE';
}


// Register the total number of requests metric endpoint
app.post('/total-req', async (req, res) => {
  try {
    requestsCounter.inc(1);
    res.status(200).send('Total number of requests sent successfully');
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
    res.status(200).send('Average request time request sent successfully');
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});


// Register the review based on user rating
app.post('/reviews', (req, res) => {
  const review = req.body;
  processReview(review);
  res.status(200).send('Review processed successfully');
});


// Register the Prometheus metrics endpoint and set custom metrics (e.g. accuracy)
app.get('/metrics', async (req, res) => {
  //compute the accuracy gauge based on correct predictions
  const bucketValues = (await reviewAccuracyHistogram.get()).values;
  const correctReviews = bucketValues.find(value => value.labels.result === 'Correct_Reviews' && value.metricName === 'review_correctness_distribution_sum');
  const totalReviews = bucketValues.find(value => value.labels.result === 'Total_Reviews' && value.metricName === 'review_correctness_distribution_sum');

  try {
    accuracyGauge.set(correctReviews.value / totalReviews.value);
  } catch (err) {
    //in case that there is no correct review or no reviews at all
    accuracyGauge.set(0);
  }


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
