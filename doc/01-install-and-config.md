# Install and Configuration

## Install

To install, just set up dependencies after clone.

    $ npm install .
    $ git submodule update --init


## Copy Configuration File

First, copy `.dist` file to the own config file.

    $ cp config/default.js.dist config/default.js


## Configuration List

Here is an original distributed configuration.

```
{
  server: {
    port: 3000
  },
  app: {
    title: 'Crocos Wiki'
  },
  security: {
    confidential: '',
    passwordSeed: "j9a5gt", // please change here
    registrationWhiteList: [
    ]
  },
  aws: {
    bucket: 'crowi',
    region: 'ap-northeast-1',
    accessKeyId: '',
    secretAccessKey: ''
  },
  mongodb: {
    host: 'localhost',
    dbname: 'crowi',
    user: '',
    password: ''
  },
  searcher: {
    url: 'https:// ...' // crocos-wikis
  },
  google: {
    clientId: '',
    clientSecret: ''
  },
  facebook: {
    appId: '',
    secret: ''
  },
  session: {
    secret: 'please input here some string',
  }
}
```

## Set Up Facebook Application

to be writte.


## Set Up Google Project

Enable configuration of Google, you can register and login by using google account.
Configure `google` section,

Registration/Login using Google account is also affected a whilelist setting on `security` section. You can restrict registrant's email by only listed emails. This setting is useful if you use Google Apps on your organization.


For more help, go to the official document.
[Google Developers Console Help](https://developers.google.com/console/help/new/#generatingoauth2)

### Create Project

To set up your project's consent screen, do the following:

1. Go to the [Google Developers Console](https://console.developers.google.com/project).
2. Select **Create Project**.
3. Fill forms and click **Create**.


### Create New Client ID

In the sidebar on the left, select Credentials, then select **Create New Client ID**.

1. Select **Web Application**
2. Fill forms as below:

   If you set up this wiki on `wiki.example.com`, fill the as below:

       https://wiki.example.com

   And fill 'Redirect URL' field as below:

       https://wiki.example.com/google/callback


So, now you can get **Client ID** and **Client Secret**, copy these values and paste it on `config/default.js`.

### Set Up Consent Screen

Make sure that the email is set on **EMAIL ADDRESSS** field.

