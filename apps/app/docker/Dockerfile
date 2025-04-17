# syntax = docker/dockerfile:1.4


##
## base
##
FROM node:20-slim AS base

ENV optDir=/opt

WORKDIR ${optDir}

# install tools
RUN apt-get update && apt-get install -y ca-certificates wget curl --no-install-recommends

# install pnpm
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" PNPM_VERSION="10.4.1" sh -
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# install turbo
RUN pnpm add turbo --global



##
## builder
##
FROM base AS builder

ENV optDir=/opt

WORKDIR ${optDir}

COPY . .

RUN pnpm add node-gyp --global
RUN pnpm install ---frozen-lockfile

# build
RUN turbo run clean
RUN turbo run build --filter @growi/app

# make artifacts
RUN pnpm deploy out --prod --filter @growi/app
RUN rm -rf apps/app/node_modules && mv out/node_modules apps/app/node_modules
RUN rm -rf apps/app/.next/cache
RUN tar -zcf packages.tar.gz \
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
  apps/app/node_modules



##
## release
##
FROM node:20-slim
LABEL maintainer="Yuki Takei <yuki@weseek.co.jp>"

ENV NODE_ENV="production"

ENV optDir=/opt
ENV appDir=${optDir}/growi

# Add gosu
# see: https://github.com/tianon/gosu/blob/1.13/INSTALL.md
RUN set -eux; \
	apt-get update; \
	apt-get install -y gosu; \
	rm -rf /var/lib/apt/lists/*; \
# verify that the binary works
	gosu nobody true

# extract artifacts as 'node' user
USER node
WORKDIR ${appDir}
RUN --mount=type=bind,from=builder,source=/tmp/packages.tar.gz,target=/tmp/packages.tar.gz \
  tar -zxf /tmp/packages.tar.gz -C ${appDir}/

COPY --chown=node:node --chmod=700 apps/app/docker/docker-entrypoint.sh /

USER root
WORKDIR ${appDir}/apps/app

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm run migrate && node -r dotenv-flow/config --expose_gc dist/server/app.js"]
