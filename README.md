![Crowi](http://res.cloudinary.com/hrscywv4p/image/upload/c_limit,f_auto,h_900,q_80,w_1200/v1/199673/https_www_filepicker_io_api_file_VpYEP32ZQyCZ85u6XCXo_zskpra.png)

<p align="center">
  <a href="https://heroku.com/deploy"><img src="https://www.herokucdn.com/deploy/button.png"></a>
</p>
<p align="center">
  <a href="https://demo.crowi-plus.org">Demo Site</a>
</p>

crowi-plus [![Chat on Slack](https://crowi-plus-slackin.weseek.co.jp/badge.svg)][slackin]
===========

[![wercker status](https://app.wercker.com/status/39cdc49d067d65c39cb35d52ceae6dc1/s/master "wercker status")](https://app.wercker.com/project/byKey/39cdc49d067d65c39cb35d52ceae6dc1)
[![dependencies status](https://david-dm.org/weseek/crowi-plus.svg)](https://david-dm.org/weseek/crowi-plus)
[![devDependencies Status](https://david-dm.org/weseek/crowi-plus/dev-status.svg)](https://david-dm.org/weseek/crowi-plus?type=dev)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)


**crowi-plus** is a fork of [Crowi][crowi] which is [perfectly compatible with the official project](https://github.com/weseek/crowi-plus/wiki/Correspondence-table-with-official-version).


Why crowi-plus?
================

* **Pluggable**
  * Find plugins from [npm](https://www.npmjs.com/browse/keyword/crowi-plugin) or [github](https://github.com/search?q=topic%3Acrowi-plugin)!
* **Faster**
  * Optimize client-side code chunks by Webpack
  * Optimize the performance when live preview
  * Adopt faster libs([date-fns](https://github.com/date-fns/date-fns), [pino](https://github.com/pinojs/pino))
  * Using CDN
* **Secure**
  * Prevent XSS (Cross Site Scripting)
  * Upgrade jQuery to 3.x and other insecure libs
  * The official Crowi status is [![dependencies Status](https://david-dm.org/crowi/crowi/status.svg)](https://david-dm.org/crowi/crowi) [![devDependencies Status](https://david-dm.org/crowi/crowi/dev-status.svg)](https://david-dm.org/crowi/crowi?type=dev)
* **Convenient**
  * Support Authentication with LDAP / Active Directory 
  * Slack Incoming Webhooks Integration
  * [Miscellaneous features](https://github.com/weseek/crowi-plus/wiki/Additional-Features)
* **[Docker Ready][dockerhub]**
* **[Docker Compose Ready][docker-compose]**
  * [Multiple sites example](https://github.com/weseek/crowi-plus-docker-compose/tree/master/examples/multi-app)
  * [HTTPS(with Let's Encrypt) proxy integration example](https://github.com/weseek/crowi-plus-docker-compose/tree/master/examples/https-portal)
* Support IE11 (Experimental)
* **Developer-friendly**
  * Less compile time
  * LiveReload separately available by server/client code change
  * Exclude Environment-dependency (confirmed to be developable on Win/Mac/Linux)

Check it out all additional features from [**here**](https://github.com/weseek/crowi-plus/wiki/Additional-Features).


Quick Start for Production
===========================

Using Heroku
------------

1. Go to https://heroku.com/deploy
1. (Optional) Input INSTALL_PLUGINS to install plugins

Using docker-compose
---------------------

```bash
git clone https://github.com/weseek/crowi-plus-docker-compose.git crowi-plus
cd crowi-plus
docker-compose up
```

See also [weseek/crowi-plus-docker-compose][docker-compose]

On-premise
----------

[**Migration Guide from Official Crowi** is here](https://github.com/weseek/crowi-plus/wiki/Migration-Guide-from-Official-Crowi).

### Dependencies

- node 6.x (DON'T USE 7.x)
- npm 4.x (DON'T USE 5.x)
- yarn
- MongoDB 3.x

See [confirmed versions](https://github.com/weseek/crowi-plus/wiki/Developers-Guide#versions-confirmed-to-work).

#### Optional Dependencies

- Redis 3.x
- ElasticSearch 5.x (needed when using Full-text search)
  - **CAUTION: Following plugins are required**
      - [Japanese (kuromoji) Analysis plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-kuromoji.html)
      - [ICU Analysis Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html)

### Start

#### Build and run the app

```bash
git clone https://github.com/weseek/crowi-plus.git
cd crowi-plus
yarn
MONGO_URI=mongodb://MONGO_HOST:MONGO_PORT/crowi npm start
```

**DON'T USE `npm install`**, use `yarn` instead.

If you launch crowi-plus with Redis and ElasticSearch, add environment variables before `npm start` like following:

```
export MONGO_URI=mongodb://MONGO_HOST:MONGO_PORT/crowi
export REDIS_URL=redis://REDIS_HOST:REDIS_PORT/crowi
export ELASTICSEARCH_URI=http://ELASTICSEARCH_HOST:ELASTICSEARCH_PORT/crowi
npm start
```

For more info, check [Developers Guide](https://github.com/weseek/crowi-plus/wiki/Developers-Guide) and [the official documents](https://github.com/crowi/crowi/wiki/Install-and-Configuration#env-parameters).

#### Command details

|command|desc|
|--|--|
|`npm run build:prod`|Build the client|
|`npm run server:prod`|Launch the server|
|`npm start`|Invoke `npm run build:prod` and `npm run server:prod`|

### Upgrade

```bash
git pull
yarn
npm start
```

### Install plugins

* Stop server if running
* `yarn add` to install plugin or `npm install --save`
  * **Don't forget `--save` option if you use npm** or crowi-plus doesn't detect plugins
* `npm start` to build client app and start server

#### Example

```bash
yarn add crowi-plugin-lsx
npm start
```


Getting Started to Develop
==========================

## Build and Run the app

1. `clone` this repository
1. `yarn global add npm@4` to install required global dependencies
1. `yarn` to install all dependencies
    * DON'T USE `npm install`
1. `npm run build` to build client app
1. `npm run server` to start the dev server
1. Access to `http://0.0.0.0:3000`

For more info, read [Developers Guide](https://github.com/weseek/crowi-plus/wiki/Developers-Guide) on Wiki.


Documentation
==============

* [github wiki pages](https://github.com/weseek/crowi-plus/wiki)
  * [Questions and Answers](https://github.com/weseek/crowi-plus/wiki/Questions-and-Answers)
  * [Migration Guide from Official Crowi](https://github.com/weseek/crowi-plus/wiki/Migration-Guide-from-Official-Crowi)
  * [Developers Guide](https://github.com/weseek/crowi-plus/wiki/Developers-Guide)

Contributing
============

Found a Bug?
-------------

If you find a bug in the source code, you can help us by
[submitting an issue][issues] to our [GitHub Repository][crowi-plus]. Even better, you can
[submit a Pull Request][pulls] with a fix.

Missing a Feature?
-------------------

You can *request* a new feature by [submitting an issue][issues] to our GitHub
Repository. If you would like to *implement* a new feature, please submit an issue with
a proposal for your work first, to be sure that we can use it.
Please consider what kind of change it is:

* For a **Major Feature**, first open an issue and outline your proposal so that it can be
discussed. This will also allow us to better coordinate our efforts, prevent duplication of work,
and help you to craft the change so that it is successfully accepted into the project.
* **Small Features** can be crafted and directly [submitted as a Pull Request][pulls].

Language
---------

Write issues and PRs in English or Japanese.

Discussion
-----------

If you have something to ask or want to discuss, [join to our Slack team][slackin] and talk about anything, anytime.


License
=======

* The MIT License (MIT)
* See LICENSE file.


[crowi]: https://github.com/crowi/crowi
[crowi-plus]: https://github.com/weseek/crowi-plus
[issues]: https://github.com/weseek/crowi-plus/issues
[pulls]: https://github.com/weseek/crowi-plus/pulls
[dockerhub]: https://hub.docker.com/r/weseek/crowi-plus
[docker-compose]: https://github.com/weseek/crowi-plus-docker-compose
[slackin]: https://crowi-plus-slackin.weseek.co.jp/
