# Use official Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Install required system packages
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    gcc \
    linux-headers \
    && ln -sf python3 /usr/bin/python

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy your source code into the container
COPY . .


# Expose the port the backend is running on
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
