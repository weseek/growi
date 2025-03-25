# syntax = docker/dockerfile:1

##
## base
##
FROM node:20-slim AS base

ENV optDir="/opt"

WORKDIR ${optDir}

# install pnpm
RUN apt-get update && apt-get install -y ca-certificates wget --no-install-recommends \
  && wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" PNPM_VERSION="10.4.1" sh -
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# install turbo
RUN pnpm add turbo --global



##
## builder
##
FROM base AS builder

ENV optDir="/opt"

WORKDIR ${optDir}

COPY . .

RUN pnpm install ---frozen-lockfile

# build
RUN turbo run clean
RUN turbo run build --filter @growi/pdf-converter

# make artifacts
RUN pnpm deploy out --prod --filter @growi/pdf-converter
RUN rm -rf apps/pdf-converter/node_modules && mv out/node_modules apps/pdf-converter/node_modules
RUN tar -zcf packages.tar.gz \
  package.json \
  apps/pdf-converter/package.json \
  apps/pdf-converter/dist \
  apps/pdf-converter/.env \
  apps/pdf-converter/node_modules



##
## release
##
FROM node:20-slim
LABEL maintainer="Yuki Takei <yuki@weseek.co.jp>"

ENV NODE_ENV="production"
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
ENV LANG="ja_JP.UTF-8"

ENV optDir="/opt"
ENV appDir="${optDir}/pdf-converter"

RUN apt-get update && apt-get install -y chromium fonts-lato fonts-ipafont-gothic fonts-noto-cjk gosu \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*; \
# verify that the binary works
    gosu nobody true

# copy artifacts
COPY --from=builder --chown=node:node \
  ${optDir}/packages.tar.gz ${appDir}/

# extract artifacts as 'node' user
USER node
WORKDIR ${appDir}
RUN tar -xf packages.tar.gz && rm packages.tar.gz

COPY --chown=node:node --chmod=700 apps/pdf-converter/docker/docker-entrypoint.sh /

USER root
WORKDIR ${appDir}/apps/pdf-converter

EXPOSE 3010

ENTRYPOINT ["/docker-entrypoint.sh"]
