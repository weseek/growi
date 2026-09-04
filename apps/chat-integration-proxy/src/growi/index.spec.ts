import * as growiLayer from './index.js';

describe('growi/ public entry point', () => {
  it('exposes exactly what the layers above it need, and nothing more', () => {
    // Asserted rather than described in a comment, for the same reason
    // `relation/index.spec.ts` asserts its own list: a barrel silently grows
    // when someone adds `export *`, and this layer's contract is what every
    // later layer reads it through.
    //
    // NOT final: task 6.3 adds `FanOutCollector` and `SearchFusion` here and
    // is the task that declares this layer's surface complete.
    expect(Object.keys(growiLayer).sort()).toEqual(['createGrowiClient']);
  });
});
