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
COPY ./packages/slack/package.json ./packages/slack/package.json
COPY ./packages/slackbot-proxy/package.json ./packages/slackbot-proxy/package.json

# setup
RUN yarn config set network-timeout 300000
RUN npx lerna bootstrap



##
## deps-resolver-prod
##
FROM node:14-slim AS deps-resolver-prod
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt

WORKDIR ${appDir}

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./lerna.json ./
COPY ./packages/slack/package.json ./packages/slack/package.json
COPY ./packages/slackbot-proxy/package.json ./packages/slackbot-proxy/package.json

# setup
RUN yarn config set network-timeout 300000

RUN npx lerna bootstrap -- --production

# copy and resolve symlink
RUN rm node_modules/@growi/slackbot-proxy
RUN cp -r --dereference node_modules node_modules.dereferenced


##
## builder
##
FROM node:14-slim AS builder
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt

WORKDIR ${appDir}

COPY --from=deps-resolver ${appDir}/node_modules ${appDir}/node_modules

# copy all packages
COPY packages ${appDir}/packages

COPY ./package.json ./
COPY ./lerna.json ./
COPY ./tsconfig.base.json ./
COPY ./packages/slack ./packages/slack
COPY ./packages/slackbot-proxy ./packages/slackbot-proxy

# build
RUN yarn lerna run build



##
## release
##
FROM node:14-slim
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV NODE_ENV production

ENV appDir /opt

COPY --from=builder \
  ${appDir}/packages/slack ${appDir}/slack
COPY --from=builder \
  ${appDir}/packages/slackbot-proxy ${appDir}/slackbot-proxy
COPY --from=deps-resolver-prod \
  ${appDir}/node_modules.dereferenced ${appDir}/node_modules

WORKDIR ${appDir}/slackbot-proxy

EXPOSE 8080

CMD ["node", "-r", "dotenv-flow/config", "dist/index.js"]
