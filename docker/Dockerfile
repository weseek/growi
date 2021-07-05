# syntax = docker/dockerfile:experimental

ARG flavor=default



##
## deps-resolver
##
FROM node:14-slim AS deps-resolver
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

WORKDIR ${appDir}
COPY ./package.json .
COPY ./yarn.lock .
COPY ./lerna.json .
COPY ./packages/app/package.json packages/app/
COPY ./packages/slack/package.json packages/slack/

# setup
RUN yarn config set network-timeout 300000
RUN npx lerna bootstrap

# make artifacts
RUN tar cf node_modules.tar node_modules \
  packages/app/node_modules \
  packages/slack/node_modules



##
## deps-resolver-prod
##
FROM deps-resolver AS deps-resolver-prod

# shrink dependencies for production
RUN yarn install --production

# make artifacts
RUN tar cf node_modules.tar node_modules \
  packages/app/node_modules \
  packages/slack/node_modules



##
## prebuilder-default
##
FROM node:14-slim AS prebuilder-default

ENV appDir /opt/growi

WORKDIR ${appDir}

# copy dependent packages
COPY --from=deps-resolver \
  ${appDir}/node_modules.tar ${appDir}/

# extract node_modules.tar
RUN tar xf node_modules.tar
RUN rm node_modules.tar



##
## prebuilder-nocdn
##
FROM prebuilder-default AS prebuilder-nocdn

# replace env.prod.js for NO_CDN
COPY docker/nocdn/env.prod.js ${appDir}/config/



##
## builder
##
# FROM prebuilder-${flavor}
FROM prebuilder-${flavor} AS builder

ENV appDir /opt/growi

WORKDIR ${appDir}

COPY ./package.json ./
COPY ./lerna.json ./
COPY ./tsconfig.base.json ./
COPY ./babel.config.js ./
COPY ./bin ./bin
COPY ./config ./config
COPY ./public ./public
COPY ./resource ./resource
COPY ./src ./src
COPY ./tmp ./tmp
# copy all related packages
COPY packages/slack packages/slack
COPY packages/app packages/app

# build
RUN yarn lerna run build

# make artifacts
RUN tar cf packages.tar \
  package.json \
  config \
  public \
  resource \
  src \
  tmp \
  packages/app/package.json \
  packages/slack/package.json \
  packages/slack/dist




##
## release
##
FROM node:14-slim
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

# Add gosu
# see: https://github.com/tianon/gosu/blob/1.13/INSTALL.md
RUN set -eux; \
	apt-get update; \
	apt-get install -y gosu; \
	rm -rf /var/lib/apt/lists/*; \
# verify that the binary works
	gosu nobody true

# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

COPY --from=deps-resolver-prod --chown=node:node \
  ${appDir}/node_modules.tar ${appDir}/
COPY --from=builder --chown=node:node \
  ${appDir}/packages.tar ${appDir}/

# extract artifacts as 'node' user
USER node
WORKDIR ${appDir}
RUN tar xf node_modules.tar
RUN tar xf packages.tar
RUN rm node_modules.tar packages.tar

USER root

COPY docker/docker-entrypoint.sh /
RUN chmod 700 /docker-entrypoint.sh
RUN chown node:node ${appDir}

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/tini", "-e", "143", "--", "/docker-entrypoint.sh"]
CMD ["yarn", "server:prod"]
