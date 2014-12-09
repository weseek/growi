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

    $ npm install .
    $ bower install
    $ grunt

More info are [here](doc/index.md).


Dependencies
-------------

* Node.js
* MongoDB
* Amazon S3
* Facebook Application (optional)
* Google Project (optional)


Start Up on Local
-------------------

Crowi is designed setting up to Heroku or some PaaS, but you can start up Crowi with ENV parameter on your local.

```
$ PASSWORD_SEED=somesecretstring MONGOHQ_URL=mongodb://username:password@localhost/crowi node app.js
```

### Environment


* `PORT`: Server port. default: `3000`.
* `NODE_ENV`: `production` OR `development`.
* `MONGO_URI`: URI to connect MongoDB. This parameter is also by `MONGOHQ_URL` OR `MONGOLAB_URI`.
* `PASSWORD_SEED`: A password seed is used by password hash generator.
* `SECRET_TOKEN`: A secret key for verifying the integrity of signed cookies.


License
---------

> The MIT License (MIT)
>
> Copyright (c) 2013 Sotaro KARASAWA <sotarok@crocos.co.jp>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
