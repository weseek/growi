
GROWI Official docker image
========================

[![Actions Status](https://github.com/weseek/growi/workflows/Release/badge.svg)](https://github.com/weseek/growi/actions) [![docker-pulls](https://img.shields.io/docker/pulls/weseek/growi.svg)](https://hub.docker.com/r/weseek/growi/) [![](https://images.microbadger.com/badges/image/weseek/growi.svg)](https://microbadger.com/images/weseek/growi)

![GROWI-x-docker](https://user-images.githubusercontent.com/1638767/38307565-105956e2-384f-11e8-8534-b1128522d68d.png)


Supported tags and respective Dockerfile links
------------------------------------------------

* [`4.4.9`, `4.4`, `4`, `latest` (Dockerfile)](https://github.com/weseek/growi/blob/v4.4.9/docker/Dockerfile)
* [`4.4.9-nocdn`, `4.4-nocdn`, `4-nocdn`, `latest-nocdn` (Dockerfile)](https://github.com/weseek/growi/blob/v4.4.9/docker/Dockerfile)
* [`4.3.3`, `4.3` (Dockerfile)](https://github.com/weseek/growi/blob/v4.3.3/docker/Dockerfile)
* [`4.3.3-nocdn`, `4.3-nocdn` (Dockerfile)](https://github.com/weseek/growi/blob/v4.3.3/docker/Dockerfile)


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

* MongoDB (>= 4.4)

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


Configuration
-----------

See [GROWI Docs: Admin Guide](https://docs.growi.org/en/admin-guide/) ([en](https://docs.growi.org/en/admin-guide/)/[ja](https://docs.growi.org/ja/admin-guide/)).

### Environment Variables

- [GROWI Docs: Environment Variables](https://docs.growi.org/en/admin-guide/admin-cookbook/env-vars.html)


Issues
------

If you have any issues or questions about this image, please contact us through  [GitHub issue](https://github.com/weseek/growi-docker/issues).

