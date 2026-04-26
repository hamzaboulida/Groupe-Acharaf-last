FROM node:20-slim AS builder

# Set pnpm home path and enable corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy root configurations for dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json tsconfig.base.json ./

# Copy package descriptors across monorepo to cache deps
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/groupe-acharaf/package.json ./artifacts/groupe-acharaf/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/db/package.json ./lib/db/

RUN pnpm --filter "@workspace/api-server" --filter "@workspace/groupe-acharaf" --filter "@workspace/mockup-sandbox" --filter "@workspace/api-zod" --filter "@workspace/api-client-react" --filter "@workspace/db" install --frozen-lockfile

# Copy the rest of the relevant source code
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/groupe-acharaf/ ./artifacts/groupe-acharaf/
COPY artifacts/mockup-sandbox/ ./artifacts/mockup-sandbox/
COPY lib/ ./lib/

# Build shared libs first
RUN pnpm --filter "@workspace/api-zod" --filter "@workspace/api-client-react" --filter "@workspace/db" install --frozen-lockfile

# Note: We run the root build. This will trigger typechecking and building all workspaces
RUN pnpm run build

# ---
# Runner Stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy minimal outputs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

COPY --from=builder /app/artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist

COPY --from=builder /app/artifacts/groupe-acharaf/package.json ./artifacts/groupe-acharaf/package.json
COPY --from=builder /app/artifacts/groupe-acharaf/dist ./artifacts/groupe-acharaf/dist

EXPOSE 5000
CMD ["node", "./artifacts/api-server/dist/index.mjs"]
