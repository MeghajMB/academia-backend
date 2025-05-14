# --- base stage ---
FROM node:23-alpine AS base

# Set working directory inside the container
WORKDIR /app

# --- build stage ---
FROM base AS build

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy your source code into the container and make the dist
COPY . .
RUN npm run build

# --- deploy stage ---
FROM base AS deploy

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Start the Kafka consumer
CMD ["npm", "start"]
