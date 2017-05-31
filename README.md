![Crowi](http://res.cloudinary.com/hrscywv4p/image/upload/c_limit,f_auto,h_900,q_80,w_1200/v1/199673/https_www_filepicker_io_api_file_VpYEP32ZQyCZ85u6XCXo_zskpra.png)

<p align="center">
  <a href="https://heroku.com/deploy"><img src="https://www.herokucdn.com/deploy/button.png"></a>
</p>


crowi-plus [![Chat on Slack](https://crowi-plus-slackin.weseek.co.jp/badge.svg)][slackin]
===========

[![wercker status](https://app.wercker.com/status/39cdc49d067d65c39cb35d52ceae6dc1/s/master "wercker status")](https://app.wercker.com/project/byKey/39cdc49d067d65c39cb35d52ceae6dc1)
[![dependencies status](https://david-dm.org/weseek/crowi-plus.svg)](https://david-dm.org/weseek/crowi-plus)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

This is **crowi-plus** that is the fork of [Crowi][crowi], is [perfectly compatible with official](https://github.com/weseek/crowi-plus/wiki/Questions-and-Answers#does-crowi-plus-have-compatibility-with-official-crowi), and has been enhanced with the following points:

* Pluggable
  * Find plugins from [npm](https://www.npmjs.com/browse/keyword/crowi-plugin) or [github](https://github.com/search?q=topic%3Acrowi-plugin)!
* Faster
  * Optimize client-side code chunks by Webpack
  * Using CDN
* Secure
  * Upgrade jQuery to 3.x
  * Upgrade other insecure libs
* [Docker Ready][dockerhub]
* [Docker Compose Ready][docker-compose]
  * [Multiple sites example](https://github.com/weseek/crowi-plus-docker-compose/tree/master/examples/multi-app)
  * [HTTPS(with Let's Encrypt) proxy integration example](https://github.com/weseek/crowi-plus-docker-compose/tree/master/examples/https-portal)
* [Added miscellaneous features](https://github.com/weseek/crowi-plus/wiki/Additional-Features)
* Developer-friendly
  * Less compile time
  * LiveReload separately available by server/client code change
  * Exclude Environment-dependency (confirmed to be developable on Win/Mac/Linux)
  
Quick Start for Production
===========================

Using Heroku
------------

1. go to https://heroku.com/deploy
1. input INSTALL_PLUGINS to install plugins
1. Upgrade Bonsai ( -> 5.x.x )

Using docker-compose
---------------------

```bash
git clone https://github.com/weseek/crowi-plus-docker-compose.git crowi-plus
cd crowi-plus
docker-compose up
```

see also [weseek/crowi-plus-docker-compose][docker-compose]

On-premise
----------

## Dependencies

- node 6.x (DON'T USE 7.x)
- npm 4.x
- yarn

### Start

```bash
git clone https://github.com/weseek/crowi-plus.git
cd crowi-plus
yarn
MONGO_URI=mongodb://example.com/crowi npm start
```

### Install plugins

* Stop server if running
* `npm install --save` to install plugin or `yarn add`
  * **Don't forget `--save` option if you use npm** or crowi-plus doesn't detect plugins
* `npm start` to build client app and start server

#### Example

```bash
yarn add crowi-plugin-lsx
npm start
```

## Other documents

More info are [here](https://github.com/crowi/crowi/wiki/Install-and-Configuration).

Getting Started to Develop
==========================

## Dependencies

- node 6.x (DON'T USE 7.x)
- npm 4.x
- yarn

* following environment is confirmed to work

    ```bash
    $ node -v
    v6.10.0
    
    $ npm -v
    4.6.1
    
    $ yarn --version
    0.24.5
    ```

## Build and Running the app
* `clone` this repository
* `npm install -g npm@4` to install required global dependencies
* `npm install` to install all dependencies or `yarn`
* `npm run build` to build client app
* `npm run server` to start the dev server in another tab

After you have installed all dependencies and build client you can now run the app. Run `npm run server` to start a local server using `node-dev` which will watch server-side codes and reload for you. The port will be displayed to you as `http://0.0.0.0:3000`.

### build and run server
```bash
# development
npm run build
npm run server
# production
npm run build:prod
npm run server:prod
```

## Other commands

### build client app
```bash
# development
npm run build:dev
# production
npm run build:prod
```

### watch client-side codes and incremental build
```bash
npm run build:dev:watch
```

### run unit tests
```bash
npm test
```

Documentation
==============

* [github wiki pages](https://github.com/weseek/crowi-plus/wiki)
  * [Questions and Answers](https://github.com/weseek/crowi-plus/wiki/Questions-and-Answers)


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

Write issues and PRs in Engulish or Japanese.

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
