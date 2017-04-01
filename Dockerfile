FROM node:6.10-alpine

ENV APP_VERSION v1.0.0-RC5
ENV APP_DIR /opt/crowi-plus

RUN apk add --no-cache --update tar
RUN apk add --no-cache --virtual .dl-deps curl \
    && mkdir -p ${APP_DIR} \
    && curl -SL https://github.com/weseek/crowi-plus/archive/${APP_VERSION}.tar.gz \
        | tar -xz -C ${APP_DIR} --strip-components 1 \
    && apk del .dl-deps

WORKDIR ${APP_DIR}

RUN apk add --no-cache --virtual .build-deps git \
    && yarn global add npm@4 \
    && yarn install --production \
    && npm run build:prod \
    && yarn cache clean \
    && apk del .build-deps

VOLUME /data
CMD ["npm", "run", "server:prod"]
