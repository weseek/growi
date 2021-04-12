# syntax = docker/dockerfile:1.2

##
## deps-resolver
##
FROM node:14-slim AS deps-resolver
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt

WORKDIR ${appDir}
COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./lerna.json ./

# setup
RUN yarn config set network-timeout 300000
RUN npx lerna bootstrap



##
## deps-resolver-prod
##
FROM deps-resolver AS deps-resolver-prod

# shrink dependencies for production
RUN yarn install --production



##
## builder
##
FROM node:14-slim AS builder
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt

COPY --from=deps-resolver ${appDir}/node_modules ${appDir}/node_modules

# copy all packages
COPY packages ${appDir}/packages

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./lerna.json ./

# build
RUN yarn lerna run --scope @growi/slack --scope @growi/slackbot-proxy build



##
## release
##
FROM gcr.io/distroless/nodejs:14
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt

COPY --from=deps-resolver-prod \
  ${appDir}/node_modules ${appDir}/node_modules
COPY --from=builder \
  ${appDir}/packages/slack/dist ${appDir}/slack
COPY --from=builder \
  ${appDir}/packages/slackbot-proxy/dist ${appDir}/slackbot-proxy

WORKDIR ${appDir}

VOLUME /data
EXPOSE 3000

CMD ["yarn", "server:prod"]
