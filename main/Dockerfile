# --- Base stage ---
FROM node:23-alpine AS base

# Set working directory inside the container
WORKDIR /app

# Install required system packages(for mediasoup)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    gcc \
    linux-headers \
    && ln -sf python3 /usr/bin/python

# --- Build Stage ---
FROM base AS build

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy all files and build typescript
COPY . .
RUN npm run build

# --- Deployment stage ---
FROM base AS deploy

# Copy only the necessary folder from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
