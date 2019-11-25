# syntax = docker/dockerfile:experimental

ARG flavor=default



##
## deps-resolver
##
FROM node:12-slim AS deps-resolver
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

COPY ./package.json ${appDir}/
COPY ./yarn.lock ${appDir}/
WORKDIR ${appDir}

# setup
RUN yarn config set network-timeout 300000
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
  yarn
# install official plugins
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
  yarn add growi-plugin-lsx growi-plugin-pukiwiki-like-linker growi-plugin-attachment-refs
# install peerDependencies
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
  yarn add -D react-images react-motion



##
## prebuilder-default
##
FROM node:12-slim AS prebuilder-default
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

COPY . ${appDir}



##
## prebuilder-nocdn
##
FROM prebuilder-default AS prebuilder-nocdn

# replace env.prod.js for NO_CDN
COPY docker/nocdn/env.prod.js ${appDir}/config/



##
## builder
##
FROM prebuilder-${flavor} AS builder

ENV appDir /opt/growi

COPY --from=deps-resolver ${appDir}/node_modules ${appDir}/node_modules

WORKDIR ${appDir}

# build
RUN yarn build:prod

# shrink dependencies for production
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
  yarn install --production

# remove unnecessary files
WORKDIR /tmp
RUN --mount=target=. sh docker/bin/remove-unnecessary-files.sh
WORKDIR ${appDir}



##
## release
##
FROM node:12-alpine
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

# install tini
RUN --mount=type=cache,target=/var/cache/apk \
  apk add tini

COPY docker/docker-entrypoint.sh /
COPY --from=builder --chown=node:node \
  ${appDir} ${appDir}

WORKDIR ${appDir}

USER node
VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["yarn", "server:prod"]
