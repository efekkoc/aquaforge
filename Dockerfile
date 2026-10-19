# AquaForge Multi-Stage Production Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm install
RUN cd server && npm install
RUN cd client && npm install

COPY . .

RUN cd server && npm run build
RUN cd client && npm run build

# Runtime Stage
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/client/dist ./client/dist

# Install OpenJDK 21 for real Minecraft servers
RUN apk add --no-cache openjdk21-jre bash

RUN cd server && npm install --omit=dev

EXPOSE 4000 5173 25565

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "server/dist/index.js"]
