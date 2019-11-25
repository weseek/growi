# syntax = docker/dockerfile:experimental

ARG flavor=default



##
## setupper-default
##
FROM node:12-slim AS setupper-default
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appVersion v3.5.13
ARG archiveName=${appVersion}
ENV appDir /opt/growi

RUN mkdir -p ${appDir}

# download GROWI archive from Github
RUN curl -SL https://github.com/weseek/growi/archive/${archiveName}.tar.gz \
    | tar -xz -C ${appDir} --strip-components 1

WORKDIR ${appDir}

# setup
RUN yarn config set network-timeout 300000
RUN yarn
# install official plugins
RUN yarn add growi-plugin-lsx growi-plugin-pukiwiki-like-linker growi-plugin-attachment-refs
# install peerDependencies
RUN yarn add -D react-images react-motion



##
## setupper-nocdn
##
FROM setupper-default AS setupper-nocdn

# replace env.prod.js for NO_CDN
COPY nocdn/env.prod.js config



##
## builder
##
FROM setupper-${flavor} AS builder

ENV appDir /opt/growi

# build
RUN yarn build:prod
# shrink dependencies for production
RUN yarn install --production

# remove unnecessary files
WORKDIR /tmp
RUN --mount=target=. sh bin/remove-unnecessary-files.sh
WORKDIR ${appDir}



##
## release
##
FROM node:12-alpine
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

# install tini
RUN apk add --no-cache tini

COPY --from=builder ${appDir} ${appDir}

# create symlink for FILE_UPLOAD=local
WORKDIR /tmp
RUN --mount=target=. sh bin/symlink-for-uploading-to-local.sh
WORKDIR ${appDir}

USER node
VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "-e", "143", "--"]
CMD ["yarn", "server:prod"]
