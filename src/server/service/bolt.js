const { EventEmitter } = require('events');

class BoltReciever extends EventEmitter {

  constructor(signingSecret, crowi) {
    super();
    this.app = crowi.express;
  }

  init(app) {
    this.bolt = app;
  }

  static addRoutes(endpoints) {
    console.log(this.app);
    for (const endpoint of endpoints) {
      this.app.post(endpoint, this.requestHandler.bind(this));
    }
  }

  async requestHandler(req, res) {
    console.log('ffffffffffffffff');
    let ackCalled = false;
    // 着信リクエストをパースするparseBody 関数があると仮定
    const parsedReq = 'parseBody(req)';
    // const parsedReq = parseBody(req);
    const event = {
      body: parsedReq.body,
      // レシーバーが確認作業に重要
      ack: (response) => {
        if (ackCalled) {
          return;
        }

        if (response instanceof Error) {
          res.status(500).send();
        }
        else if (!response) {
          res.send('');
        }
        else {
          res.send(response);
        }

        ackCalled = true;
      },
    };
    await this.bolt.processEvent(event);
  }

}

const { App } = require('@slack/bolt');

class BoltService {

  constructor(crowi) {
    this.crowi = crowi;
    // Bolt の Receiver を明に生成
    this.receiver = new BoltReciever(process.env.SLACK_SIGNING_SECRET, crowi);
    // App をこのレシーバーを指定して生成
    this.bolt = new App({
      token: process.env.SLACK_BOT_TOKEN,
      receiver: this.receiver,
    });
    // Slack とのやりとりは App のメソッドで定義
    this.bolt.event('message', async({ event, client }) => {
      // Do some slack-specific stuff here
      // await client.chat.postMessage(...);
    });
  }

}

module.exports = BoltService;
