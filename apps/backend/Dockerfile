FROM node:22-alpine

WORKDIR /server

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter @dtc/backend... --ignore-scripts

COPY apps/backend apps/backend

ENV NODE_ENV=production
ENV MEDUSA_TELEMETRY_DISABLED=true

RUN pnpm --filter @dtc/backend build

EXPOSE 9000

# Medusa's production build lives in .medusa/server. Starting from the
# generated directory ensures the admin assets and compiled config are found.
WORKDIR /server/apps/backend/.medusa/server

CMD ["/server/apps/backend/node_modules/.bin/medusa", "start"]
