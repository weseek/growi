// TODO: make interface with TS
class ConfigPubsubHandlable {

  souldHandleConfigPubsubMessage(configPubsubMessage) {
    throw new Error('implement this');
  }

  async handleConfigPubsubMessage(configPubsubMessage) {
    throw new Error('implement this');
  }

}

module.exports = ConfigPubsubHandlable;
