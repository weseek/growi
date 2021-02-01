// const { EventEmitter } = require('events');

// // /**
// //  * the service class of SlackNotificationService
// //  */
// // class BoltRecieverService extends EventEmitter {

// //   init(app) {
// //     this.bolt = app;
// //   }

// //   // // This is a very simple implementation. Look at the ExpressReceiver source for more detail
// //   async requestHandler(req, res) {
// //   //   let ackCalled = false;

// //     //   const event = {
// //     //     body: req.body,
// //     //     // Receivers are responsible for handling acknowledgements
// //     //     // `ack` should be prepared to be called multiple times and
// //     //     // possibly with `response` as an error
// //     //     ack: (response) => {
// //     //       if (ackCalled) {
// //     //         return;
// //     //       }

// //     //       if (response instanceof Error) {
// //     //         res.status(500).send();
// //     //       }
// //     //       else if (!response) {
// //     //         res.send('');
// //     //       }
// //     //       else {
// //     //         res.send(response);
// //     //       }

// //   //       ackCalled = true;
// //   //     },
// //   //   };
// //   //   await this.bolt.processEvent(event);
// //   }

// // }

// // module.exports = BoltRecieverService;


// class BoltRecieverService extends EventEmitter {

//   constructor(signingSecret, endpoints, crowi) {
//     super();
//     this.app = crowi.express;

//     for (const endpoint of endpoints) {
//       this.app.post(endpoint, this.requestHandler.bind(this));
//     }
//   }

//   init(app) {
//     this.bolt = app;
//   }

//   async requestHandler(req, res) {
//     let ackCalled = false;
//     // 着信リクエストをパースするparseBody 関数があると仮定
//     const parsedReq = 'parseBody(req)';
//     // const parsedReq = parseBody(req);
//     const event = {
//       body: parsedReq.body,
//       // レシーバーが確認作業に重要
//       ack: (response) => {
//         if (ackCalled) {
//           return;
//         }

//         if (response instanceof Error) {
//           res.status(500).send();
//         }
//         else if (!response) {
//           res.send('');
//         }
//         else {
//           res.send(response);
//         }

//         ackCalled = true;
//       },
//     };
//     await this.bolt.processEvent(event);
//   }

// }


// const { App, ExpressReceiver } = require('@slack/bolt');

// // Bolt の Receiver を明に生成
// // const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
// const receiver = new BoltRecieverService({ signingSecret: process.env.SLACK_SIGNING_SECRET, endpoints: [], crowi: crowi });

// // App をこのレシーバーを指定して生成
// const bolt = new App({
//   token: process.env.SLACK_BOT_TOKEN,
//   receiver,
// });

// // Slack とのやりとりは App のメソッドで定義
// bolt.event('message', async({ event, client }) => {
//   // Do some slack-specific stuff here
//   // await client.chat.postMessage(...);
//   console.log('wwwwwwwwwwwwwwwwwwwwwwwwww');
// });
