# Sketchalot - Collaborative Drawing App
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/http-backend/package.json ./apps/http-backend/
COPY apps/ws-backend/package.json ./apps/ws-backend/

# Install dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Install individual app dependencies
RUN cd apps/frontend && pnpm install
RUN cd apps/http-backend && pnpm install
RUN cd apps/ws-backend && pnpm install

# Copy source code
COPY . .

# Expose ports
# 3000: Frontend (Next.js)
# 3001: HTTP Backend (Express)
# 8080: WebSocket Backend
# 8081: Database (if needed)
EXPOSE 3000 3001 8080 8081

# Start all services in development mode
CMD ["sh", "-c", "cd apps/http-backend && pnpm dev & cd apps/ws-backend && pnpm dev & cd apps/frontend && pnpm dev & wait"]
