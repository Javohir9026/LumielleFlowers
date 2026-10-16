FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_UPLOADS_URL=
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_UPLOADS_URL=$NEXT_PUBLIC_UPLOADS_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

COPY apps/web apps/web
COPY packages/shared packages/shared
RUN npm run build -w @lumielle/shared && npm run build -w @lumielle/web

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@lumielle/web"]
