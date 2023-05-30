# syntax = docker/dockerfile:1.4


##
## base
##
FROM node:18-slim AS base

ENV optDir /opt

WORKDIR ${optDir}

RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@growi/app --docker


##
## deps-resolver
##
FROM node:18-slim AS deps-resolver

ENV optDir /opt

WORKDIR ${optDir}

RUN set -eux; \
	apt-get update; \
	apt-get install -y python3 build-essential;

# copy files
COPY --from=base ${optDir}/out/json/ .
COPY --from=base ${optDir}/out/yarn.lock ./yarn.lock

# setup (with network-timeout = 1 hour)
RUN yarn config set network-timeout 3600000
RUN yarn --frozen-lockfile

# make artifacts
RUN tar -cf node_modules.tar \
  node_modules \
  apps/*/node_modules \
  packages/*/node_modules



##
## deps-resolver-prod
##
FROM deps-resolver AS deps-resolver-prod

RUN yarn --production
# make artifacts
RUN tar -cf node_modules.tar \
  node_modules \
  apps/*/node_modules \
  packages/*/node_modules



##
## builder
##
FROM node:18-slim AS builder

ENV optDir /opt

WORKDIR ${optDir}

RUN yarn global add turbo

# copy files
COPY --from=base ${optDir}/out/full/ .
COPY --from=base ${optDir}/out/yarn.lock ./yarn.lock
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
FROM node:18-slim
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV NODE_ENV production

ENV optDir /opt
ENV appDir ${optDir}/growi

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
CMD ["yarn migrate && node -r dotenv-flow/config --expose_gc dist/server/app.js"]
