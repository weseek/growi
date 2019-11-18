FROM node:12-slim
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV APP_VERSION v3.5.13
ENV APP_DIR /opt/growi
ARG ARCHIVE_NAME=${APP_VERSION}

# update tar for '--strip-components' option
RUN apk add --no-cache --update tar
# download GROWI archive from Github
RUN apk add --no-cache --virtual .dl-deps curl \
    && mkdir -p ${APP_DIR} \
    && curl -SL https://github.com/weseek/growi/archive/${ARCHIVE_NAME}.tar.gz \
        | tar -xz -C ${APP_DIR} --strip-components 1 \
    && apk del .dl-deps

WORKDIR ${APP_DIR}

# setup
RUN apk add --no-cache --virtual .build-deps git \
    && yarn config set network-timeout 300000 \
    && yarn \
    # install official plugins
    && yarn add growi-plugin-lsx growi-plugin-pukiwiki-like-linker growi-plugin-attachment-refs \
    # install peerDependencies
    && yarn add -D react-images react-motion \
    # build
    && npm run build:prod \
    # shrink dependencies for production
    && yarn install --production \
    && yarn cache clean \
    && apk del .build-deps

COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "server:prod"]
