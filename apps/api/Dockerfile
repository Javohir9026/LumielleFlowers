FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

COPY apps/api apps/api
COPY packages/shared packages/shared
RUN npm run build -w @lumielle/shared && npm run prisma:generate -w @lumielle/api && npm run build -w @lumielle/api

RUN mkdir -p /data/uploads
ENV NODE_ENV=production
ENV UPLOADS_DIR=/data/uploads
EXPOSE 4000
CMD ["sh", "-c", "npm run prisma:deploy -w @lumielle/api && npm run seed:admin -w @lumielle/api && npm run start -w @lumielle/api"]
