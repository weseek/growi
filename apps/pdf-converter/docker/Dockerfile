########################################################################
# deps-resolver
########################################################################
FROM node:20-slim AS deps-resolver

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile

RUN tar -cf node_modules.tar \
  node_modules \
  && rm -rf node_modules


########################################################################
# deps-resolver-prod
########################################################################
FROM deps-resolver AS deps-resolver-prod

WORKDIR /app

RUN yarn --production

RUN tar -cf node_modules.tar \
  node_modules \
  && rm -rf node_modules


########################################################################
# builder
########################################################################
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json yarn.lock tsconfig.json tsconfig.build.json .eslintrc.js ./
COPY src ./src
COPY --from=deps-resolver /app/node_modules.tar ./

RUN tar -xf node_modules.tar \
  && rm node_modules.tar \
  && yarn build \
  && tar -cf packages.tar \
    package.json \
    yarn.lock \
    dist \
  && rm -rf node_modules


########################################################################
# production
########################################################################
FROM node:20-slim

ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV LANG=ja_JP.UTF-8

RUN apt-get update && apt-get install -y tini chromium locales fonts-ipafont fonts-ipaexfont fonts-ipafont-gothic fonts-ipafont-mincho && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && echo "ja_JP UTF-8" > /etc/locale.gen && locale-gen

USER node
WORKDIR /app

COPY --from=deps-resolver-prod --chown=node:node \
  /app/node_modules.tar ./
COPY --from=builder --chown=node:node \
  /app/packages.tar ./

RUN tar -xf node_modules.tar \
  && tar -xf packages.tar \
  && rm node_modules.tar packages.tar

# change permission for shared volume
RUN mkdir -p /tmp/page-bulk-export && chmod -R 777 /tmp/page-bulk-export

EXPOSE 3010

ENTRYPOINT ["/usr/bin/tini", "-e", "143", "--"]
CMD ["node", "dist/index.js"]
