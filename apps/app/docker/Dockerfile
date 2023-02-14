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
## deps-resolver
##
FROM node:16-slim AS deps-resolver

ENV optDir /opt

WORKDIR ${optDir}

ENV nodeModulesGrowiPackagesDir ${optDir}/node_modules/@growi
# expect a string seperated by commas (e.g. "A,B")
ENV removeNodeModulesSymlinkPaths ${nodeModulesGrowiPackagesDir}/slackbot-proxy

RUN set -eux; \
	apt-get update; \
	apt-get install -y python3 build-essential;

# copy files
COPY --from=packages-json-picker ${optDir} .

# setup (with network-timeout = 1 hour)
RUN yarn config set network-timeout 3600000
RUN npx -y lerna bootstrap -- --frozen-lockfile

# remove unnecessary symlinks
RUN rm -f $(echo ${removeNodeModulesSymlinkPaths} | sed -e "s/,/ /g")

# make artifacts
RUN tar -cf node_modules.tar \
  node_modules \
  packages/*/node_modules



##
## deps-resolver-prod
##
FROM deps-resolver AS deps-resolver-prod

# remove unnecessary packages
RUN rm -rf packages/slackbot-proxy

RUN npx -y lerna bootstrap -- --production
# make artifacts
RUN tar -cf node_modules.tar \
  node_modules \
  packages/*/node_modules


##
## prebuilder
##
FROM node:16-slim AS prebuilder

ENV optDir /opt

WORKDIR ${optDir}

# copy dependent packages
COPY --from=deps-resolver \
  ${optDir}/node_modules.tar ${optDir}/

# extract node_modules.tar
RUN tar -xf node_modules.tar
RUN rm node_modules.tar



##
## builder
##
FROM prebuilder AS builder

ENV optDir /opt

WORKDIR ${optDir}

# ignore eslint and stylelint
COPY ["package.json", "lerna.json", "tsconfig.base.json", "./"]
# copy all related packages
COPY packages/codemirror-textlint packages/codemirror-textlint
COPY packages/preset-themes packages/preset-themes
COPY packages/slack packages/slack
COPY packages/hackmd packages/hackmd
COPY packages/presentation packages/presentation
COPY packages/remark-drawio packages/remark-drawio
COPY packages/remark-growi-directive packages/remark-growi-directive
COPY packages/remark-lsx packages/remark-lsx
COPY packages/ui packages/ui
COPY packages/core packages/core
COPY packages/app packages/app

# build
RUN yarn lerna run build

# make artifacts
RUN tar -cf packages.tar \
  package.json \
  packages/app/.next \
  packages/app/config \
  packages/app/public \
  packages/app/resource \
  packages/app/tmp \
  packages/app/.env.production* \
  packages/app/next.config.js \
  packages/*/package.json \
  packages/*/dist



##
## release
##
FROM node:16-slim
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

COPY --chown=node:node --chmod=700 packages/app/docker/docker-entrypoint.sh /

USER root
WORKDIR ${appDir}/packages/app

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["yarn migrate && node -r dotenv-flow/config --expose_gc dist/server/app.js"]
