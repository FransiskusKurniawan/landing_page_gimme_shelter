# Use the official Node.js 20 Alpine image as base
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_DEBUG_MODE
ARG NEXT_PUBLIC_ENABLE_EXPORT
ARG CUSTOM_KEY
ARG NODE_ENV

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_DEBUG_MODE=$NEXT_PUBLIC_DEBUG_MODE
ENV NEXT_PUBLIC_ENABLE_EXPORT=$NEXT_PUBLIC_ENABLE_EXPORT
ENV CUSTOM_KEY=$CUSTOM_KEY
ENV NODE_ENV=$NODE_ENV

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create a fallback if standalone output is not available
RUN if [ ! -f "server.js" ]; then \
    echo "const { createServer } = require('http');" > server.js && \
    echo "const { parse } = require('url');" >> server.js && \
    echo "const next = require('next');" >> server.js && \
    echo "const dev = process.env.NODE_ENV !== 'production';" >> server.js && \
    echo "const hostname = '0.0.0.0';" >> server.js && \
    echo "const port = process.env.PORT || 3000;" >> server.js && \
    echo "const app = next({ dev, hostname, port });" >> server.js && \
    echo "const handle = app.getRequestHandler();" >> server.js && \
    echo "app.prepare().then(() => {" >> server.js && \
    echo "  createServer(async (req, res) => {" >> server.js && \
    echo "    try {" >> server.js && \
    echo "      const parsedUrl = parse(req.url, true);" >> server.js && \
    echo "      await handle(req, res, parsedUrl);" >> server.js && \
    echo "    } catch (err) {" >> server.js && \
    echo "      console.error('Error occurred handling', req.url, err);" >> server.js && \
    echo "      res.statusCode = 500;" >> server.js && \
    echo "      res.end('internal server error');" >> server.js && \
    echo "    }" >> server.js && \
    echo "  }).listen(port, (err) => {" >> server.js && \
    echo "    if (err) throw err;" >> server.js && \
    echo "    console.log(\`> Ready on http://\${hostname}:\${port}\`);" >> server.js && \
    echo "  });" >> server.js && \
    echo "});" >> server.js; \
fi

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
