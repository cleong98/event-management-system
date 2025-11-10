# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Install dumb-init and su-exec for proper signal handling and user switching
RUN apk add --no-cache dumb-init su-exec

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create uploads directory with correct permissions
RUN mkdir -p uploads && chown -R node:node uploads && chmod -R 775 uploads

# Expose port
EXPOSE 3000

# Use entrypoint to fix permissions before starting
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Generate Prisma Client and start development server
CMD ["dumb-init", "sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start:dev"]

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init and su-exec
RUN apk add --no-cache dumb-init su-exec

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma Client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create uploads directory with correct permissions
RUN mkdir -p uploads && chown -R node:node uploads && chmod -R 775 uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint to fix permissions before starting
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Start production server
CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy && node dist/main"]
