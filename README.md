<p align="center">
  <a href="https://growi.org">
    <img src="https://user-images.githubusercontent.com/1638767/38254268-d4476bbe-3793-11e8-964c-8865d690baff.png" width="240px">
  </a>
</p>
<p align="center">
  <a href="https://github.com/weseek/growi/releases/latest"><img src="https://img.shields.io/github/release/weseek/growi.svg"></a>
  <a href="https://growi-slackin.weseek.co.jp/"><img src="https://growi-slackin.weseek.co.jp/badge.svg"></a>
</p>

<p align="center">
  <a href="https://demo.growi.org">Demo Site</a>
</p>
<p align="center">
  <a href="https://heroku.com/deploy"><img src="https://www.herokucdn.com/deploy/button.png"></a>
</p>


GROWI 
===========

[![wercker status](https://app.wercker.com/status/595b761d0e26796ddb304679f7bf27de/s/master "wercker status")](https://app.wercker.com/project/byKey/595b761d0e26796ddb304679f7bf27de)
[![dependencies status](https://david-dm.org/weseek/growi.svg)](https://david-dm.org/weseek/growi)
[![devDependencies Status](https://david-dm.org/weseek/growi/dev-status.svg)](https://david-dm.org/weseek/growi?type=dev)
[![docker pulls](https://img.shields.io/docker/pulls/weseek/growi.svg)](https://hub.docker.com/r/weseek/growi/)

- [Features](#features)
- [Quick Start for Production](#quick-start-for-production)
    - [On-premise](#on-premise)
    - [Using Heroku](#using-heroku)
    - [Using docker-compose](#using-docker-compose)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [License](#license)


Features
========

* **Pluggable**
  * You can find plugins from [npm](https://www.npmjs.com/browse/keyword/growi-plugin) or [github](https://github.com/search?q=topic%3Agrowi-plugin)!
* **Features**
  * Create hierarchical pages with markdown
  * Simultaneously edit with multiple people by [HackMD(CodiMD)](https://hackmd.io/) integration
  * Support Authentication with LDAP / Active Directory, OAuth
  * SSO(Single Sign On) with SAML
  * Slack/Mattermost, IFTTT Integration
  * [Miscellaneous features](https://github.com/weseek/growi/wiki/Additional-Features)
* **[Docker Ready][dockerhub]**
* **[Docker Compose Ready][docker-compose]**
  * [Multiple sites example](https://github.com/weseek/growi-docker-compose/tree/master/examples/multi-app)
  * [HTTPS(with Let's Encrypt) proxy integration example](https://github.com/weseek/growi-docker-compose/tree/master/examples/https-portal)
* Support IE11 (Experimental)

Quick Start for Production
===========================

Using Heroku
------------

1. Go to https://heroku.com/deploy
2. (Optional) Input INSTALL_PLUGINS to install plugins

Using docker-compose
---------------------

```bash
git clone https://github.com/weseek/growi-docker-compose.git growi
cd growi
docker-compose up
```

See also [weseek/growi-docker-compose][docker-compose]

On-premise
----------

[**Migration Guide from Crowi** is here](https://docs.growi.org/guide/migration-guide/from-crowi-onpremise.html).

### Dependencies

- Node.js v10.x (DON'T USE 11.x)
- npm 6.x
- yarn
- MongoDB 3.x

See [confirmed versions](https://docs.growi.org/dev/startup/dev-env.html#versions-confirmed-to-work).

#### Optional Dependencies

- Redis 3.x
- ElasticSearch 6.x (needed when using Full-text search)
  - **CAUTION: Following plugins are required**
      - [Japanese (kuromoji) Analysis plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-kuromoji.html)
      - [ICU Analysis Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html)

### How to start

#### Build and run the app

```bash
git clone https://github.com/weseek/growi.git
cd growi
yarn
MONGO_URI=mongodb://MONGO_HOST:MONGO_PORT/growi npm start
```

**DO NOT USE `npm install`**, use `yarn` instead.

If you launch growi with ElasticSearch, add environment variables before `npm start` like following:

```
export MONGO_URI=mongodb://MONGO_HOST:MONGO_PORT/growi
export ELASTICSEARCH_URI=http://ELASTICSEARCH_HOST:ELASTICSEARCH_PORT/growi
npm start
```

For more info, see [Developers Guide](https://docs.growi.org/dev/).

#### Command details

|command|desc|
|--|--|
|`npm run build:prod`|Build the client|
|`npm run server:prod`|Launch the server|
|`npm start`|Invoke `npm run build:prod` and `npm run server:prod`|

### How to upgrade

```bash
git pull
yarn
npm start
```

### How to install plugins

* Stop server if server is running
* `yarn add` to install plugin or `npm install`
* `npm start` to build client app and start server

#### Examples

```bash
yarn add growi-plugin-lsx
npm start
```

For more info, see [Developers Guide](https://docs.growi.org/dev/) on docs.growi.org.


Environment Variables
======================

* **Required**
    * MONGO_URI: URI to connect to MongoDB.
* **Option**
    * NODE_ENV: `production` OR `development`.
    * PORT: Server port. default: `3000`.
    * NO_CDN: If `true`, system doesn't use CDN, all resources will be downloaded from CDN when build client, and served by the GROWI Express server. default: `false`.
    * ELASTICSEARCH_URI: URI to connect to Elasticearch.
    * REDIS_URI: URI to connect to Redis (use it as a session store instead of MongoDB).
    * PASSWORD_SEED: A password seed used by password hash generator.
    * SECRET_TOKEN: A secret key for verifying the integrity of signed cookies.
    * SESSION_NAME: The name of the session ID cookie to set in the response by Express. default: `connect.sid`
    * FILE_UPLOAD: Attached files storage. default: `aws`
      * `aws` : AWS S3 (needs AWS settings on Admin page)
      * `mongodb` : MongoDB GridFS (Setting-less)
      * `local` : Server's Local file system (Setting-less)
      * `none` : Disable file uploading
    * MAX_FILE_SIZE: The maximum file size limit for uploads (bytes). default: `Infinity`
    * MONGO_GRIDFS_TOTAL_LIMIT: Total capacity limit of MongoDB GridFS (bytes). default: `Infinity`
    * SAML_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: If `true`, the system uses only the value of the environment variable as the value of the SAML option that can be set via the environment variable.
    * PUBLISH_OPEN_API: Publish GROWI OpenAPI resources with [ReDoc](https://github.com/Rebilly/ReDoc). Visit `/api-docs`.
* **Option to integrate with external systems**
    * HACKMD_URI: URI to connect to [HackMD(CodiMD)](https://hackmd.io/) server.
        * **This server must load the GROWI agent. [Here's how to prepare it](https://docs.growi.org/guide/admin-cookbook/integrate-with-hackmd.html).**
    * HACKMD_URI_FOR_SERVER: URI to connect to [HackMD(CodiMD)](https://hackmd.io/) server from GROWI Express server. If not set, `HACKMD_URI` will be used.
    * PLANTUML_URI: URI to connect to [PlantUML](http://plantuml.com/) server.
    * BLOCKDIAG_URI: URI to connect to [blockdiag](http://http://blockdiag.com/) server.
* **Option (Overwritable in admin page)**
    * APP_SITE_URL: Site URL. e.g. `https://example.com`, `https://example.com:8080`
    * OAUTH_GOOGLE_CLIENT_ID: Google API client id for OAuth login.
    * OAUTH_GOOGLE_CLIENT_SECRET: Google API client secret for OAuth login.
    * OAUTH_GITHUB_CLIENT_ID: GitHub API client id for OAuth login.
    * OAUTH_GITHUB_CLIENT_SECRET: GitHub API client secret for OAuth login.
    * OAUTH_TWITTER_CONSUMER_KEY: Twitter consumer key(API key) for OAuth login.
    * OAUTH_TWITTER_CONSUMER_SECRET: Twitter consumer secret(API secret) for OAuth login.
    * SAML_ENABLED: Enable or disable SAML
    * SAML_ENTRY_POINT: IdP entry point
    * SAML_ISSUER: Issuer string to supply to IdP
    * SAML_ATTR_MAPPING_ID: Attribute map for id
    * SAML_ATTR_MAPPING_USERNAME: Attribute map for username
    * SAML_ATTR_MAPPING_MAIL: Attribute map for email
    * SAML_ATTR_MAPPING_FIRST_NAME: Attribute map for first name
    * SAML_ATTR_MAPPING_LAST_NAME:  Attribute map for last name
    * SAML_CERT: PEM-encoded X.509 signing certificate string to validate the response from IdP


Documentation
==============

- [GROWI Docs](https://docs.growi.org/)


Contribution
============

Found a Bug?
-------------

If you found a bug in the source code, you can help us by
[submitting an issue][issues] to our [GitHub Repository][growi]. Even better, you can
[submit a Pull Request][pulls] with a fix.

Missing a Feature?
-------------------

You can *request* a new feature by [submitting an issue][issues] to our GitHub
Repository. If you would like to *implement* a new feature, firstly please submit the issue with your proposal to make sure we can confirm it. Please clarify what kind of change you would like to propose.

* For a **Major Feature**, firstly open an issue and outline your proposal so it can be discussed.  
It also allows us to coordinate better, prevent duplication of work and help you to create the change so it can be successfully accepted into the project.
* **Small Features** can be created and directly [submitted as a Pull Request][pulls].

Translation
--------------

We have some Transifex Projects.

* [GROWI (Internationalize)](https://www.transifex.com/weseek-inc/growi)
* [GROWI Docs (Internationalize)](https://www.transifex.com/weseek-inc/growi-docs)

Please join to our team!


Language on GitHub
------------------

You can write issues and PRs in English or Japanese.

Discussion
-----------

If you have questions or suggestions, you can [join our Slack team](https://growi-slackin.weseek.co.jp/) and talk about anything, anytime.


License
=======

* The MIT License (MIT)
* See LICENSE file.


[crowi]: https://github.com/crowi/crowi
[growi]: https://github.com/weseek/growi
[issues]: https://github.com/weseek/growi/issues
[pulls]: https://github.com/weseek/growi/pulls
[dockerhub]: https://hub.docker.com/r/weseek/growi
[docker-compose]: https://github.com/weseek/growi-docker-compose
