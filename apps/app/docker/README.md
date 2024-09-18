
GROWI Official docker image
========================

[![Actions Status](https://github.com/weseek/growi/workflows/Release/badge.svg)](https://github.com/weseek/growi/actions) [![docker-pulls](https://img.shields.io/docker/pulls/weseek/growi.svg)](https://hub.docker.com/r/weseek/growi/) [![](https://images.microbadger.com/badges/image/weseek/growi.svg)](https://microbadger.com/images/weseek/growi)

![GROWI-x-docker](https://private-user-images.githubusercontent.com/113958844/368474296-1a82236d-5a85-4a2e-842a-971b4c1625e6.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjY2NDY2ODEsIm5iZiI6MTcyNjY0NjM4MSwicGF0aCI6Ii8xMTM5NTg4NDQvMzY4NDc0Mjk2LTFhODIyMzZkLTVhODUtNGEyZS04NDJhLTk3MWI0YzE2MjVlNi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQwOTE4JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MDkxOFQwNzU5NDFaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0wYzI3MDI0ZmUzNzExODIxZjNiMTBkZjZhNmJmMWM5YjUwNmM2ODk3MzRkNmJmYTEwMjlkNjFiMjY0MzUyYjkxJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZhY3Rvcl9pZD0wJmtleV9pZD0wJnJlcG9faWQ9MCJ9.LIae-VaUkj2X9S6e-DBNDv2-JjPa3rfn85YMeyV-lCg)


Supported tags and respective Dockerfile links
------------------------------------------------

* [`7.0.19`, `7.0`, `7`, `latest` (Dockerfile)](https://github.com/weseek/growi/blob/v7.0.19/apps/app/docker/Dockerfile)
* [`6.3.2`, `6.3`, `6` (Dockerfile)](https://github.com/weseek/growi/blob/v6.3.2/apps/app/docker/Dockerfile)
* [`6.2.4`, `6.2` (Dockerfile)](https://github.com/weseek/growi/blob/v6.2.4/apps/app/docker/Dockerfile)
* [`6.1.15`, `6.1` (Dockerfile)](https://github.com/weseek/growi/blob/v6.1.15/apps/app/docker/Dockerfile)


What is GROWI?
-------------

GROWI is a team collaboration software and it forked from [crowi](https://github.com/weseek/crowi/crowi)

see: [weseek/growi](https://github.com/weseek/growi)


Requirements
-------------

* MongoDB (>= 4.4)

### Optional Dependencies

* ElasticSearch (>= 7.17)
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

