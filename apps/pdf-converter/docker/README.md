
GROWI PDF Converter Official docker image
==============================================

[![Node CI for slackbot-proxy](https://github.com/weseek/growi/actions/workflows/ci-pdf-converter.yml/badge.svg)](https://github.com/weseek/growi/actions/workflows/ci-slackbot-proxy.yml) [![docker-pulls](https://img.shields.io/docker/pulls/weseek/growi-pdf-converter.svg)](https://hub.docker.com/r/weseek/growi-pdf-converter/)


Supported tags and respective Dockerfile links
------------------------------------------------

* [`1.0.0`, `latest` (Dockerfile)](https://github.com/weseek/growi/blob/master/apps/pdf-converter/docker/Dockerfile)


What is GROWI PDF Converter used for?
---------------------------------------

GROWI provides a feature that bulk exports pages in PDF format.
PDF Converter is necessary to convert markdown pages to PDF during that process.


Usage
-----

```bash
docker run -d weseek/pdf-converter
```

and go to `http://localhost:3010/` .

### docker-compose

(TBD)

Configuration
-----------

(TBD)
