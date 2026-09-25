# ══════════════════════════════════════════
# Stage 1: Build React app with Node.js
# ══════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build production bundle
RUN npm run build


# ══════════════════════════════════════════
# Stage 2: Serve with Nginx (no Node needed)
# ══════════════════════════════════════════
FROM nginx:alpine

# Copy built assets from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config (React Router support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
