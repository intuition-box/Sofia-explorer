# Stage 1: Build
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json bun.lock ./
COPY packages/ packages/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build graphql package first, then the app
RUN cd packages/graphql && bun run build && cd ../.. && bun run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
