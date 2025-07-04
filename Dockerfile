# syntax=docker/dockerfile:1

# Install dependencies only when needed
FROM node:20-slim AS deps
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./

# Build the Next.js application
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Set dummy environment variables for build
ENV OPENAI_API_KEY=sk-dummy-build-key-for-docker
ENV NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-anon-key
ENV SUPABASE_SERVICE_ROLE_KEY=dummy-service-key
RUN npm run build

# Production image, copy only necessary files
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user to run the app
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy built output and static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Optionally copy env file (uncomment if needed)
# COPY .env.production .
# COPY .env.local .

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"] 