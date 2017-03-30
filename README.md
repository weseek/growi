![Crowi](http://res.cloudinary.com/hrscywv4p/image/upload/c_limit,f_auto,h_900,q_80,w_1200/v1/199673/https_www_filepicker_io_api_file_VpYEP32ZQyCZ85u6XCXo_zskpra.png)

crowi-plus
===========

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/weseek/crowi-plus/tree/v1.0.0-RC2)

[![wercker status](https://app.wercker.com/status/39cdc49d067d65c39cb35d52ceae6dc1/s/master "wercker status")](https://app.wercker.com/project/byKey/39cdc49d067d65c39cb35d52ceae6dc1)
[![dependencies status](https://david-dm.org/weseek/crowi-plus.svg)](https://david-dm.org/weseek/crowi-plus)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

crowi-plus is the fork of [Crowi](https://github.com/crowi/crowi), has been enhanced with the following points:

* Pluggable
  * Find plugins from [npm](https://www.npmjs.com/browse/keyword/crowi-plugin) or [github](https://github.com/search?q=topic%3Acrowi-plugin)!
* Faster
  * Optimize client-side code chunks by Webpack
  * Using CDN
* Secure
  * Upgrade jQuery to 3.x
  * Upgrade other insecure libs
* Added miscellaneous features
* Developer-friendly
  * Less compile time
  * LiveReload separately available by server/client code change
  * Exclude Environment-dependency (confirmed to be developable on Win/Mac/Linux)
  

Quick Start for Production
---------------------------

(TBD)

More info are [here](https://github.com/crowi/crowi/wiki/Install-and-Configuration).


Startup for Developers
-----------------------

### Requirements

- node >= 6.x
- npm >= 4.x
- yarn >= 0.21.x

#### Confirmed to work

```bash
$ node -v
v6.10.0
$ npm -v
4.5.0
$ yarn --version
0.21.3
```

### Start development

```bash
# Install Dependencies
yarn
# Build client-side codes
npm run build
# Run development server and watch server-side codes
npm run server
```

#### Incremental client-side Building

Run following in another process:

```bash
$ npm run build:dev:watch
```


Other Relational Documents
---------------------------

see [github wiki pages](https://github.com/weseek/crowi-plus/wiki)

License
---------

* The MIT License (MIT)
* See LICENSE file.
