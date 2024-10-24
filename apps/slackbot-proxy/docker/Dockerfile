# syntax = docker/dockerfile:1.4

##
## base
##
FROM node:20-slim AS base

ENV optDir /opt

WORKDIR ${optDir}

# install pnpm
RUN apt-get update && apt-get install -y ca-certificates wget --no-install-recommends \
  && wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -
ENV PNPM_HOME "/root/.local/share/pnpm"
ENV PATH "$PNPM_HOME:$PATH"

# install turbo
RUN pnpm add turbo --global



##
## partialrepos
##
FROM base AS partialrepos

ENV optDir /opt

WORKDIR ${optDir}

COPY . .
RUN turbo prune @growi/slackbot-proxy --docker



##
## deps-resolver
##
FROM base AS deps-resolver

ENV optDir /opt

WORKDIR ${optDir}

# copy files
COPY --from=partialrepos ${optDir}/out/json/ .
COPY --from=partialrepos ${optDir}/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm add node-gyp --global
RUN pnpm install --no-frozen-lockfile

# make artifacts
RUN tar -cf node_modules.tar \
  node_modules \
  apps/*/node_modules \
  packages/*/node_modules



##
## deps-resolver-prod
##
FROM deps-resolver AS deps-resolver-prod

RUN pnpm install --no-frozen-lockfile --prod
# make artifacts
RUN tar -cf node_modules.tar \
  node_modules \
  apps/*/node_modules \
  packages/*/node_modules



##
## builder
##
FROM base AS builder

ENV optDir /opt

WORKDIR ${optDir}

RUN yarn global add turbo

# copy files
COPY --from=partialrepos ${optDir}/out/full/ .
COPY --from=partialrepos ${optDir}/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY ["tsconfig.base.json", "./"]

# copy dependent packages
COPY --from=deps-resolver \
  ${optDir}/node_modules.tar ${optDir}/

# extract node_modules.tar
RUN tar -xf node_modules.tar
RUN rm node_modules.tar

# build
RUN turbo run build

# make artifacts
RUN tar -cf packages.tar \
  package.json \
  apps/*/package.json \
  apps/*/dist \
  apps/*/.env \
  packages/*/package.json \
  packages/*/dist



##
## release
##
FROM node:20-slim
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV NODE_ENV production

ENV optDir /opt
ENV appDir ${optDir}/slackbot-proxy

# Add pnpm
RUN apt-get update && apt-get install -y ca-certificates wget --no-install-recommends \
  && wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh - \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false
ENV PNPM_HOME "/root/.local/share/pnpm"
ENV PATH "$PNPM_HOME:$PATH"

# copy artifacts
COPY --from=deps-resolver-prod --chown=node:node \
  ${optDir}/node_modules.tar ${appDir}/
COPY --from=builder --chown=node:node \
  ${optDir}/packages.tar ${appDir}/

# extract artifacts as 'node' user
USER node
WORKDIR ${appDir}
RUN tar -xf node_modules.tar
RUN tar -xf packages.tar
RUN rm node_modules.tar packages.tar

WORKDIR ${appDir}/apps/slackbot-proxy

EXPOSE 8080

CMD ["node", "-r", "dotenv-flow/config", "dist/index.js"]
