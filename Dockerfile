# Smart Turbo Frontend Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for dependency caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1000 smartturbo && \
    adduser -u 1000 -G smartturbo -s /bin/sh -D smartturbo && \
    chown -R smartturbo:smartturbo /usr/share/nginx/html && \
    chown -R smartturbo:smartturbo /var/cache/nginx && \
    chown -R smartturbo:smartturbo /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R smartturbo:smartturbo /var/run/nginx.pid

# Switch to non-root user
USER smartturbo

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
