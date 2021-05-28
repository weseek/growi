# syntax = docker/dockerfile:1.2

##
## deps-resolver-base
##
FROM node:14-slim AS deps-resolver-base

ENV appDir /opt

WORKDIR ${appDir}
COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./lerna.json ./
COPY ./packages/slack/package.json ./packages/slack/package.json
COPY ./packages/slackbot-proxy/package.json ./packages/slackbot-proxy/package.json

# setup
RUN yarn config set network-timeout 300000



##
## deps-resolver-dev
##
FROM deps-resolver-base AS deps-resolver-dev
RUN npx lerna bootstrap



##
## deps-resolver-prod
##
FROM deps-resolver-base AS deps-resolver-prod
RUN npx lerna bootstrap -- --production
# make artifacts
RUN tar cf dependencies.tar node_modules packages/slackbot-proxy/node_modules


##
## builder
##
FROM node:14-slim AS builder

ENV appDir /opt

WORKDIR ${appDir}

COPY --from=deps-resolver-dev ${appDir}/node_modules node_modules

# copy all related packages
COPY packages/slack packages/slack
COPY packages/slackbot-proxy packages/slackbot-proxy

COPY ./package.json ./
COPY ./lerna.json ./
COPY ./tsconfig.base.json ./
COPY ./packages/slack ./packages/slack
COPY ./packages/slackbot-proxy ./packages/slackbot-proxy

# build
RUN yarn lerna run build

# make artifacts
RUN tar cf packages.tar \
  packages/slack/package.json \
  packages/slack/dist \
  packages/slackbot-proxy/package.json \
  packages/slackbot-proxy/dist



##
## release
##
FROM node:14-slim
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV NODE_ENV production

ENV appDir /opt

# copy artifacts
COPY --from=deps-resolver-prod --chown=node:node \
  ${appDir}/dependencies.tar ${appDir}/
COPY --from=builder --chown=node:node \
  ${appDir}/packages.tar ${appDir}/

RUN chown node:node ${appDir}

USER node

# extract artifacts
WORKDIR ${appDir}
RUN tar xf dependencies.tar
RUN tar xf packages.tar
RUN rm dependencies.tar packages.tar

WORKDIR ${appDir}/packages/slackbot-proxy

EXPOSE 8080

CMD ["node", "-r", "dotenv-flow/config", "dist/index.js"]
