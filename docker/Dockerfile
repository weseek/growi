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

COPY ./package.json ./
COPY ./lerna.json ./
COPY ./tsconfig.base.json ./
# copy all related packages
COPY packages/slack packages/slack
COPY packages/app packages/app

# copy dependent packages
COPY --from=deps-resolver ${appDir}/node_modules .
COPY --from=deps-resolver ${appDir}/packages/slack/node_modules packages/slack/
COPY --from=deps-resolver ${appDir}/packages/app/node_modules packages/app/



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
RUN yarn build:prod

# make artifacts
RUN tar cf packages.tar \
  packages/app/package.json \
  packages/app/config \
  packages/app/public \
  packages/app/tmp \
  packages/slack/package.json \
  packages/slack/dist




##
## release
##
FROM node:14-slim
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

COPY --from=deps-resolver-prod --chown=node:node \
  ${appDir}/node_modules.tar ${appDir}/
COPY --from=builder --chown=node:node \
  ${appDir}/packages.tar ${appDir}/

COPY docker/docker-entrypoint.sh /
RUN chmod 700 /docker-entrypoint.sh
RUN chown node:node ${appDir}

USER node

# extract node_modules.tar
WORKDIR ${appDir}
RUN tar xf node_modules.tar
RUN tar xf packages.tar
RUN rm node_modules.tar packages.tar

WORKDIR ${appDir}

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "-e", "143", "--", "/docker-entrypoint.sh"]
CMD ["yarn", "server:prod"]
