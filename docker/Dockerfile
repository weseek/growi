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
  yarn add -D react-images@1.0.0 react-motion



##
## deps-resolver-prod
##
FROM deps-resolver AS deps-resolver-prod

# shrink dependencies for production
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
  yarn install --production



##
## prebuilder-default
##
FROM node:12-slim AS prebuilder-default
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

COPY --from=deps-resolver ${appDir}/node_modules ${appDir}/node_modules

# copy all files except the files listed in Dockerfile.dockerignore
COPY . ${appDir}

# overwirte package.json and yarn.lock
COPY --from=deps-resolver ${appDir}/package.json ${appDir}/package.json
COPY --from=deps-resolver ${appDir}/yarn.lock ${appDir}/yarn.lock



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

WORKDIR ${appDir}

# build
RUN --mount=type=cache,target=./node_modules/.cache \
  yarn build:prod

# remove except artifacts
WORKDIR /tmp
RUN --mount=target=. sh docker/bin/remove-except-artifacts.sh
WORKDIR ${appDir}



##
## release
##
FROM node:12-alpine
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

# install tini
RUN --mount=type=cache,target=/var/cache/apk \
  apk add tini su-exec

COPY docker/docker-entrypoint.sh /
RUN chmod 700 /docker-entrypoint.sh

COPY --from=deps-resolver-prod --chown=node:node \
  ${appDir}/node_modules ${appDir}/node_modules
COPY --from=builder --chown=node:node \
  ${appDir} ${appDir}

WORKDIR ${appDir}

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "-e", "143", "--", "/docker-entrypoint.sh"]
CMD ["yarn", "server:prod"]
