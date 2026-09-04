// Public entry point of the `growi/` layer (design.md's File Structure Plan:
// 「この層の公開窓口」). Layers to the right of `growi/` -- `orchestration/`
// and `routes/` -- import from here, never from the files below.
//
// Opened by task 6.1 with `GrowiClient` alone. Task 6.3 (「この層の入口も
// ここでまとめる」) adds `FanOutCollector` and `SearchFusion` and declares
// this surface final; until then this list grows with the layer.

export type {
  GrowiCallFailure,
  GrowiCallResult,
  GrowiClient,
  GrowiClientDeps,
} from './growi-client.js';
export { createGrowiClient } from './growi-client.js';
