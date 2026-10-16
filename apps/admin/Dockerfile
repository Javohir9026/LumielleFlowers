FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

COPY apps/admin apps/admin
COPY packages/shared packages/shared
ENV VITE_BASE_PATH=/admin/
RUN npm run build -w @lumielle/shared && npm run build -w @lumielle/admin

FROM nginx:1.27-alpine
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
