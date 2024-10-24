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
RUN turbo prune @growi/app --docker


##
## deps-resolver
##
FROM base AS deps-resolver

ENV optDir /opt

WORKDIR ${optDir}

RUN set -eux; \
	apt-get update; \
	apt-get install -y python3 build-essential;

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
RUN turbo run clean
RUN turbo run build

# make artifacts
RUN rm -rf apps/app/.next/cache
RUN tar -cf packages.tar \
  package.json \
  apps/app/.next \
  apps/app/config \
  apps/app/dist \
  apps/app/public \
  apps/app/resource \
  apps/app/tmp \
  apps/app/.env.production* \
  apps/app/next.config.js \
  apps/app/package.json \
  packages/*/package.json \
  packages/*/dist



##
## release
##
FROM node:20-slim
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV NODE_ENV production

ENV optDir /opt
ENV appDir ${optDir}/growi

# Add pnpm
RUN apt-get update && apt-get install -y ca-certificates wget --no-install-recommends \
  && wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh - \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false
ENV PNPM_HOME "/root/.local/share/pnpm"
ENV PATH "$PNPM_HOME:$PATH"

# Add gosu
# see: https://github.com/tianon/gosu/blob/1.13/INSTALL.md
RUN set -eux; \
	apt-get update; \
	apt-get install -y gosu; \
	rm -rf /var/lib/apt/lists/*; \
# verify that the binary works
	gosu nobody true

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

COPY --chown=node:node --chmod=700 apps/app/docker/docker-entrypoint.sh /

USER root
WORKDIR ${appDir}/apps/app

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["pnpm run migrate && node -r dotenv-flow/config --expose_gc dist/server/app.js"]
