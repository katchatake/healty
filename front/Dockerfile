# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Disable Nuxt Telemetry and limit memory usage to prevent VPS compilation crash
ENV NUXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=1024"

COPY package*.json ./
RUN npm ci

COPY . .

# Build Nuxt application for production
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Only copy build output
COPY --from=builder /app/.output ./.output

# Expose port
EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Start compiled Nitro server
CMD ["node", ".output/server/index.mjs"]
