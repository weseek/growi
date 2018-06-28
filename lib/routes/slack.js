module.exports = function(text) {
  const slackFunc = {};
  slackFunc.send = function(text) {
    const Slack = require('slack-node');

    const webhookUri = 'https://hooks.slack.com/services/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 ';

    const slack = new Slack();
    slack.setWebhook(webhookUri);

    slack.webhook({
      channel: '#general',
      username: 'Growi',
      text: '`comment uploaded`'
    }, function(err, response) {
      console.log(response);
    });
    console.log('i\'m in: text is: ', text);
  };

  return slackFunc;
};
