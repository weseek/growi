class ReconnectContext {

  constructor() {
    this.reset(true);
  }

  reset() {
    this.counter = 0;
    this.stage = 1;
  }

  incrementCount() {
    this.counter++;
  }

  incrementStage() {
    this.counter = 0; // reset counter
    this.stage++;
  }

  get shouldReconnect() {
    const thresholdOfThisStage = 10 * Math.log2(this.stage); // 0, 10, 15.9, 20, 23.2, 25.9, 28.1, 30, ...
    return this.counter > thresholdOfThisStage;
  }

}

function nextTick(context) {
  context.incrementCount();
  return context.shouldReconnect;
}

module.exports = {
  ReconnectContext,
  nextTick,
};
