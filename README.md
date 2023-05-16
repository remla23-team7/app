# base

## Project setup

```
# yarn
yarn

# npm
npm install

# pnpm
pnpm install
```

### Compiles and hot-reloads for development

```
# yarn
yarn dev
node src/monitoring/prometheus.js

# npm - Use this to run both frontend + Prometheus monitoring
npm run dev

# pnpm
pnpm dev
```


### Compiles and minifies for production

```
# yarn
yarn build

# npm
npm run build

# pnpm
pnpm build
```

### Lints and fixes files

```
# yarn
yarn lint

# npm
npm run lint

# pnpm
pnpm lint
```

## Monitoring
The app exposes a Prometheus endpoint at `HOST:3001/monitoring` that can handle the following metrics

- `review_app_requests_total` - Counter: The total number of requests recorded by the app


- `request_processing_seconds` - Summary: Average time spent processing a review request.


- `review_rating` - Histogram: Distribution of review ratings (on a scale from 1 to 5 with a 0.5 increment),
  based on user rating.
It uses the following labels in order to create the metric
  - `rating`: `positive`,  `negative` or  `neutral` based on a scale from 1 to 5
  - `sentiment`: `positive` or `negative` where positive is considered above 2.5, negative below 2.5 and 2.5 representing neutral


- `review_correctness_distribution` - Histogram: Distribution of review ratings by correctness
  To monitor accuracy the following data is used (data is labeled as Correct_Reviews, Incorrect_Reviews, Inconclusive_Reviews, Total_Reviews):
    - `predicted_sentiment`: `positive` or `negative`
    - `sentiment`: `positive` or `negative` where positive is considered above 2.5, negative below 2.5 and 2.5 representing neutral


- `review_prediction_accuracy` - Gauge: Accuracy rate of rating predictions.


### Customize configuration

See [Configuration Reference](https://vitejs.dev/config/).
