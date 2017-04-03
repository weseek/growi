![Crowi](http://res.cloudinary.com/hrscywv4p/image/upload/c_limit,f_auto,h_900,q_80,w_1200/v1/199673/https_www_filepicker_io_api_file_VpYEP32ZQyCZ85u6XCXo_zskpra.png)

crowi-plus
===========

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/weseek/crowi-plus/tree/v1.0.0-RC9)

[![wercker status](https://app.wercker.com/status/39cdc49d067d65c39cb35d52ceae6dc1/s/master "wercker status")](https://app.wercker.com/project/byKey/39cdc49d067d65c39cb35d52ceae6dc1)
[![dependencies status](https://david-dm.org/weseek/crowi-plus.svg)](https://david-dm.org/weseek/crowi-plus)
[![docker build automated](https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg)](https://hub.docker.com/r/weseek/crowi-plus/)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![Join the chat at https://gitter.im/weseek/crowi-plus](https://badges.gitter.im/weseek/crowi-plus.svg)](https://gitter.im/weseek/crowi-plus?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is **crowi-plus** that is the fork of [Crowi](https://github.com/crowi/crowi), is [perfectly compatible with official](https://github.com/weseek/crowi-plus/wiki/Question-and-Answers#does-crowi-plus-have-compatibility-with-official-crowi), and has been enhanced with the following points:

* Pluggable
  * Find plugins from [npm](https://www.npmjs.com/browse/keyword/crowi-plugin) or [github](https://github.com/search?q=topic%3Acrowi-plugin)!
* Faster
  * Optimize client-side code chunks by Webpack
  * Using CDN
* Secure
  * Upgrade jQuery to 3.x
  * Upgrade other insecure libs
* [Docker Ready](https://hub.docker.com/r/weseek/crowi-plus/)
* [Added miscellaneous features](https://github.com/weseek/crowi-plus/wiki/Additional-Features)
* Developer-friendly
  * Less compile time
  * LiveReload separately available by server/client code change
  * Exclude Environment-dependency (confirmed to be developable on Win/Mac/Linux)
  
Quick Start for Production
===========================

Using docker-compose
---------------------

(TBD)

More info are [here](https://github.com/crowi/crowi/wiki/Install-and-Configuration).

Install plugins
================

* Stop server if running
* `npm install --save` to install plugin or `yarn add`
  * **Don't forget `--save` option if you use npm** or crowi-plus doesn't detect plugins
* `npm start` to build client app and start server

## Example

```bash
yarn add crowi-plugin-lsx
npm start
```

Getting Started to Develop
==========================

## Dependencies
What you need to run this app:
* `node` and `npm` (`brew install node`)
* following environment is confirmed to work

    ```bash
    $ node -v
    v6.10.0
    
    $ npm -v
    4.5.0
    
    $ yarn --version
    0.21.3
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

Documents
----------

* [github wiki pages](https://github.com/weseek/crowi-plus/wiki)
  * [Question and Answers](https://github.com/weseek/crowi-plus/wiki/Question-and-Answers)


License
---------

* The MIT License (MIT)
* See LICENSE file.
