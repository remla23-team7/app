# Build stage
FROM node:16-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Production stage
FROM nginx:1.21-alpine AS production

# Copy package.json and production dependencies from the build stage
COPY --from=build /app/package.json /usr/src/app/package.json
COPY --from=build /app/node_modules /usr/src/app/node_modules

# Copy prometheus.js from build stage
COPY --from=build /app/src/monitoring/prometheus.js /usr/src/app/prometheus.js

#add node to run prometheus
RUN apk add --update nodejs npm

# Copy the built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Set the working directory
WORKDIR /usr/src/app

# Set the NODE_ENV environment variable to "production"
ENV NODE_ENV=production

# Expose port 80 for Nginx and port 3001 for Prometheus
EXPOSE 80:80 3001:3001

# Start Nginx and the Prometheus.js file
CMD ["sh", "-c", "nginx -g 'daemon off;' & node prometheus.js"]
