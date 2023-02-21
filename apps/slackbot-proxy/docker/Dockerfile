# syntax = docker/dockerfile:1.4

##
## packages-json-picker
##
FROM node:16-slim AS packages-json-picker

ENV optDir /opt

WORKDIR ${optDir}
COPY ["package.json", "yarn.lock", "lerna.json", "./"]
COPY packages packages
# Find and remove non-package.json files
RUN find packages \! -name "package.json" -mindepth 2 -maxdepth 2 -print | xargs rm -rf


##
## deps-resolver-dev
##
FROM node:16-slim AS deps-resolver-dev

ENV optDir /opt

WORKDIR ${optDir}

# copy files
COPY --from=packages-json-picker ${optDir} .

# setup
RUN yarn config set network-timeout 300000
RUN npx -y lerna bootstrap -- --frozen-lockfile

# make artifacts
RUN tar -cf node_modules.tar \
  node_modules \
  packages/*/node_modules



##
## deps-resolver-prod
##
FROM node:16-slim AS deps-resolver-prod

ENV optDir /opt

WORKDIR ${optDir}
COPY ["package.json", "yarn.lock", "lerna.json", "./"]
COPY ./packages/slack/package.json ./packages/slack/package.json
COPY ./apps/slackbot-proxy/package.json ./apps/slackbot-proxy/package.json

RUN npx -y lerna bootstrap -- --production
# make artifacts
RUN tar -cf dependencies.tar \
  node_modules \
  packages/*/node_modules



##
## builder
##
FROM node:16-slim AS builder

ENV optDir /opt

WORKDIR ${optDir}

# copy dependent packages
COPY --from=deps-resolver-dev \
  ${optDir}/node_modules.tar ${optDir}/

# extract node_modules.tar
RUN tar -xf node_modules.tar
RUN rm node_modules.tar

COPY ["package.json", "lerna.json", "tsconfig.base.json", "./"]
# copy all related packages
COPY packages/slack packages/slack
COPY apps/slackbot-proxy apps/slackbot-proxy

# build
RUN yarn lerna run build

# make artifacts
RUN tar -cf packages.tar \
  packages/slack/package.json \
  packages/slack/dist \
  apps/slackbot-proxy/package.json \
  apps/slackbot-proxy/.env \
  apps/slackbot-proxy/dist



##
## release
##
FROM node:16-slim
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV NODE_ENV production

ENV optDir /opt
ENV appDir ${optDir}

USER node

WORKDIR ${appDir}
# copy artifacts
COPY --from=deps-resolver-prod --chown=node:node \
  ${optDir}/dependencies.tar ./
COPY --from=builder --chown=node:node \
  ${optDir}/packages.tar ./

# extract artifacts
RUN tar -xf dependencies.tar
RUN tar -xf packages.tar
RUN rm dependencies.tar packages.tar

WORKDIR ${appDir}/apps/slackbot-proxy

EXPOSE 8080

CMD ["node", "-r", "dotenv-flow/config", "dist/index.js"]
