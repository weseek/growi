![Crowi](http://res.cloudinary.com/hrscywv4p/image/upload/c_limit,f_auto,h_900,q_80,w_1200/v1/199673/https_www_filepicker_io_api_file_VpYEP32ZQyCZ85u6XCXo_zskpra.png)

Crowi - The Simple & Powerful Communication Tool Based on Wiki
================================================================


[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/crowi/crowi/tree/v1.6.0)

[![Circle CI](https://circleci.com/gh/crowi/crowi.svg?style=svg)](https://circleci.com/gh/crowi/crowi)
[![Join the chat at https://gitter.im/crowi/general](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/crowi/general)


Crowi is:

* Easy to edit and share,
* Markdown supported,
* Useful timeline list view,
* Fast.


Install
---------

Install dependencies and build CSS and JavaScript:

    $ npm install

More info is [here](https://github.com/crowi/crowi/wiki/Install-and-Configuration).

### WARNING

Don't use `master` branch because it is unstable. Use released version except when you want to contribute to the project.


Dependencies
-------------

* Node.js (6.x)
* MongoDB
* Elasticsearch (optional) ([Doc is here](https://github.com/crowi/crowi/wiki/Configure-Search-Functions))
* Redis (optional)
* Amazon S3 (optional)
* Google Project (optional)
* Slack App (optional)


Start Up on Local
-------------------

Crowi is designed to be set up on Heroku or some PaaS, but you can also start up Crowi with ENV parameter on your local.

```
$ PASSWORD_SEED=somesecretstring MONGO_URI=mongodb://username:password@localhost/crowi node app.js
```
or please write `.env`.

### Environment


* `PORT`: Server port. default: `3000`.
* `NODE_ENV`: `production` OR `development`.
* `MONGO_URI`: URI to connect to MongoDB. This parameter is also by `MONGOHQ_URL` OR `MONGOLAB_URI`.
* `REDIS_URL`: URI to connect to Redis (to session store). This parameter is also by `REDISTOGO_URL`.
* `ELASTICSEARCH_URI`: URI to connect to Elasticearch.
* `PASSWORD_SEED`: A password seed used by password hash generator.
* `SECRET_TOKEN`: A secret key for verifying the integrity of signed cookies.
* `FILE_UPLOAD`: `aws` (default), `local`, `none`

see: [.env.sample](./.env.sample)

License
---------

* The MIT License (MIT)
* See LICENSE file.
