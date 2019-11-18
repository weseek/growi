##
## STAGE 1
##
FROM node:12-slim AS builder
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV APP_VERSION v3.5.13
ENV APP_DIR /opt/growi
ARG ARCHIVE_NAME=${APP_VERSION}

# update tar for '--strip-components' option
# RUN apk add --no-cache --update tar
# download GROWI archive from Github
# RUN apk add --no-cache --virtual .dl-deps curl \
RUN mkdir -p ${APP_DIR}
RUN curl -SL https://github.com/weseek/growi/archive/${ARCHIVE_NAME}.tar.gz \
    | tar -xz -C ${APP_DIR} --strip-components 1

WORKDIR ${APP_DIR}

# setup
RUN yarn config set network-timeout 300000
RUN yarn
# install official plugins
RUN yarn add growi-plugin-lsx growi-plugin-pukiwiki-like-linker growi-plugin-attachment-refs
# install peerDependencies
RUN yarn add -D react-images react-motion
# build
RUN npm run build:prod
# shrink dependencies for production
RUN yarn install --production

##
## STAGE 2
##
FROM node:12-alpine
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV APP_DIR /opt/growi

# install tini
RUN apk add --no-cache tini

USER node

COPY --from=builder ${APP_DIR} ${APP_DIR}

WORKDIR ${APP_DIR}

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "-e", "143", "--"]
CMD ["npm", "run", "server:prod"]
