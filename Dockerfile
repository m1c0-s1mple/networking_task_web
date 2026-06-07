# ==========================================
# STAGE 1: Compilation environment
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install package definitions
COPY package*.json ./

# Install development dependencies
RUN npm ci

# Copy full application codebase
COPY . .

# Build both React static assets and bundled Express server
RUN npm run build

# ==========================================
# STAGE 2: Lightweight production runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set container environment parameters
ENV NODE_ENV=production
ENV PORT=3000

# Copy package structures and lock files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy static builds and compiled server bundles from stage 1
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/server/data ./server/data

# Expose system egress port (3000 is our ingress layer)
EXPOSE 3000

# Start up using compiling bundle on AWS environment
CMD ["node", "dist/server.cjs"]
