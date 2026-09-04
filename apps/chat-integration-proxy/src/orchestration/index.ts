// This layer's public entry point, opened by task 7.1. **NOT final**: task 7.3
// adds `inbound-flow.ts` and settles this list (the same way `growi/index.ts`
// was opened by 6.1 and settled by 6.3).
//
// `CommandFlow` and `LinkPostedEvent` are here because implementing the flow
// means naming both. `KNOWN_COMMAND_WORDS` and `EventSinkDeps` are NOT: the
// first is how the routing decision is made (this layer's own business, read
// only by `event-sink.spec.ts`), and the second is only ever written inline at
// the composition point.
//
// `parseTimeRange` / `TIME_RANGE_USAGE` stay internal for the same reason:
// they exist because `command-flow.ts` is the side that calls `fetchHistory`,
// and no layer to the right of this one interprets a range.
export type { CommandFlowDeps, CommandFlowPlatform } from './command-flow.js';
export { createCommandFlow } from './command-flow.js';
export type { CommandFlow, LinkPostedEvent } from './event-sink.js';
export { createEventSink } from './event-sink.js';
