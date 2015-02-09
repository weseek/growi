Crowi - The Simple & Powerful Communication Tool Based on Wiki
================================================================


[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)


Crowi is:

* Easy to edit and share,
* Markdown supported,
* Useful timeline list view,
* Fast.


Install
---------

Install dependencies and build CSS and JavaScript:

    $ npm install

More info are [here](doc/index.md).


Dependencies
-------------

* Node.js (0.10.x)
* MongoDB
* Redis (optional)
* Amazon S3
* Facebook Application (optional)
* Google Project (optional)


Start Up on Local
-------------------

Crowi is designed setting up to Heroku or some PaaS, but you can start up Crowi with ENV parameter on your local.

```
$ PASSWORD_SEED=somesecretstring MONGO_URI=mongodb://username:password@localhost/crowi node app.js
```

### Environment


* `PORT`: Server port. default: `3000`.
* `NODE_ENV`: `production` OR `development`.
* `MONGO_URI`: URI to connect MongoDB. This parameter is also by `MONGOHQ_URL` OR `MONGOLAB_URI`.
* `REDIS_URL`: URI to connect Redis (to session store). This parameter is also by `REDISTOGO_URL`.
* `PASSWORD_SEED`: A password seed is used by password hash generator.
* `SECRET_TOKEN`: A secret key for verifying the integrity of signed cookies.


License
---------

* The MIT License (MIT)
* See LICENSE file.
