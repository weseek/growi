
GROWI Official docker image
========================

[![Actions Status](https://github.com/weseek/growi/workflows/Release%20Docker%20Images/badge.svg)](https://github.com/weseek/growi/actions) [![docker-pulls](https://img.shields.io/docker/pulls/weseek/growi.svg)](https://hub.docker.com/r/weseek/growi/) [![](https://images.microbadger.com/badges/image/weseek/growi.svg)](https://microbadger.com/images/weseek/growi)

![GROWI-x-docker](https://user-images.githubusercontent.com/1638767/38307565-105956e2-384f-11e8-8534-b1128522d68d.png)


Supported tags and respective Dockerfile links
------------------------------------------------

* [`3.6.2`, `3.6`, `3`, `latest`, (Dockerfile)](https://github.com/weseek/growi/blob/v3.6.2/docker/Dockerfile)
* [`3.6.2-nocdn`, `3.6-nocdn`, `3-nocdn`, `latest-nocdn`, (Dockerfile)](https://github.com/weseek/growi/blob/v3.6.2/docker/Dockerfile)
* [`3.5.25`, `3.5`, `3`, (Dockerfile)](https://github.com/weseek/growi-docker/blob/v3.5.25/Dockerfile)
* [`3.5.25-nocdn`, `3.5-nocdn`, `3-nocdn` (Dockerfile)](https://github.com/weseek/growi-docker/blob/v3.5.25/nocdn/Dockerfile)
* [`3.4.7`, `3.4`, `3`, (Dockerfile)](https://github.com/weseek/growi-docker/blob/v3.4.7/Dockerfile)
* [`3.4.7-nocdn`, `3.4-nocdn`, `3-nocdn` (Dockerfile)](https://github.com/weseek/growi-docker/blob/v3.4.7/nocdn/Dockerfile)


What is GROWI?
-------------

GROWI is a team collaboration software and it forked from [crowi](https://github.com/weseek/crowi/crowi)

see: [weseek/growi](https://github.com/weseek/growi)

What is growi-docker?
-------------------

The GROWI official docker image for production use which concludes several official plugins.

- [growi-plugin-lsx](https://www.npmjs.com/package/growi-plugin-lsx)
- [growi-plugin-pukiwiki-like-linker](https://www.npmjs.com/package/growi-plugin-pukiwiki-like-linker)
- [growi-plugin-attachment-refs](https://www.npmjs.com/package/growi-plugin-attachment-refs)



Requirements
-------------

* MongoDB (>= 3.6)

### Optional Dependencies

* ElasticSearch (>= 6.6)
  * Japanese (kuromoji) Analysis plugin
  * ICU Analysis Plugin


Usage
-----

```bash
docker run -d \
    -e MONGO_URI=mongodb://MONGODB_HOST:MONGODB_PORT/growi \
    weseek/growi
```

and go to `http://localhost:3000/` .

If you use ElasticSearch, type this:

```bash
docker run -d \
    -e MONGO_URI=mongodb://MONGODB_HOST:MONGODB_PORT/growi \
    -e ELASTICSEARCH_URI=http://ELASTICSEARCH_HOST:ELASTICSEARCH_PORT/growi \
    weseek/growi
```


### docker-compose

Using docker-compose is the fastest and the most convenient way to boot GROWI.

see: [weseek/growi-docker-compose](https://github.com/weseek/growi-docker-compose)


Environment Variables
-------------------

* **Required**
    * MONGO_URI: URI to connect to MongoDB.
* **Option**
    * NODE_ENV: `production` OR `development`.
    * PORT: Server port. default: `3000`
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
    * FORCE_WIKI_MODE: Forces wiki mode. default: undefined
      * `public`  : Forces all pages to become public
      * `private` : Forces all pages to become private
      * undefined : Publicity will be configured by the admin security page settings
    * FORMAT_NODE_LOG: If `false`, Output server log as JSON. defautl: `true` (Enabled only when `NODE_ENV=production`)
* **Option to integrate with external systems**
    * HACKMD_URI: URI to connect to [HackMD(CodiMD)](https://hackmd.io/) server.
        * **This server must load the GROWI agent. [Here's how to prepare it](https://docs.growi.org/management-cookbook/integrate-with-hackmd).**
    * HACKMD_URI_FOR_SERVER: URI to connect to [HackMD(CodiMD)](https://hackmd.io/) server from GROWI Express server. If not set, `HACKMD_URI` will be used.
    * PLANTUML_URI: URI to connect to [PlantUML](http://plantuml.com/) server.
    * BLOCKDIAG_URI: URI to connect to [blockdiag](http://http://blockdiag.com/) server.
* **Option (Overwritable in admin page)**
    * APP_SITE_URL: Site URL. e.g. `https://example.com`, `https://example.com:8080`
    * LOCAL_STRATEGY_ENABLED: Enable or disable ID/Pass login
    * LOCAL_STRATEGY_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: Prioritize env vars than values in DB for some ID/Pass login options
    * SAML_ENABLED: Enable or disable SAML
    * SAML_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: Prioritize env vars than values in DB for some SAML options
    * SAML_ENTRY_POINT: IdP entry point
    * SAML_ISSUER: Issuer string to supply to IdP
    * SAML_ATTR_MAPPING_ID: Attribute map for id
    * SAML_ATTR_MAPPING_USERNAME: Attribute map for username
    * SAML_ATTR_MAPPING_MAIL: Attribute map for email
    * SAML_ATTR_MAPPING_FIRST_NAME: Attribute map for first name
    * SAML_ATTR_MAPPING_LAST_NAME:  Attribute map for last name
    * SAML_CERT: PEM-encoded X.509 signing certificate string to validate the response from IdP
    * OAUTH_GOOGLE_CLIENT_ID: Google API client id for OAuth login.
    * OAUTH_GOOGLE_CLIENT_SECRET: Google API client secret for OAuth login.
    * OAUTH_GITHUB_CLIENT_ID: GitHub API client id for OAuth login.
    * OAUTH_GITHUB_CLIENT_SECRET: GitHub API client secret for OAuth login.
    * OAUTH_TWITTER_CONSUMER_KEY: Twitter consumer key(API key) for OAuth login.
    * OAUTH_TWITTER_CONSUMER_SECRET: Twitter consumer secret(API secret) for OAuth login.

Other Documentation
--------------------

* [GROWI Github wiki](https://github.com/weseek/growi/wiki)
  * [Questions and Answers](https://github.com/weseek/growi/wiki/Questions-and-Answers)


Issues
------

If you have any issues or questions about this image, please contact us through  [GitHub issue](https://github.com/weseek/growi-docker/issues).

