# Use the smallest LTS Node.js image available (Alpine Linux)
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for better build caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the source code
COPY src/ ./src/

# Copy the scores directory for 2025-11 special case
COPY scores/ ./scores/

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Start the bot
CMD ["node", "src/index.js"]