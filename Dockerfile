# STAGE 1: Build
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy dependency files first to leverage Docker layer caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the application using your esbuild script defined in package.json
RUN bun run build

# STAGE 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies to keep the image slim
COPY package.json ./
RUN npm install --omit=dev

# Copy the bundled code from the builder stage
COPY --from=builder /app/dist ./dist
# Copy the env example to use as a template inside the container
COPY --from=builder /app/.env.example ./
COPY --from=builder /app/.env.example ./.env

# Use a non-root user for security (provided by the node-alpine image)
USER node

# Document the port the app listens on
EXPOSE 5000

# Start the application using the start script
CMD ["node", "dist/server.js"]
