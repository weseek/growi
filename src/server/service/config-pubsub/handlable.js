// TODO: make interface with TS
class ConfigPubsubMessageHandlable {

  souldHandleConfigPubsubMessage(configPubsubMessage) {
    throw new Error('implement this');
  }

  async handleConfigPubsubMessage(configPubsubMessage) {
    throw new Error('implement this');
  }

}

module.exports = ConfigPubsubMessageHandlable;
