// Public barrel for `types/` -- every cross-layer type this app declares.
// Every layer from `capabilities/` onward (see design.md's declared
// dependency order: `types -> capabilities -> db -> platform -> command ->
// relation -> growi -> orchestration -> routes`) imports these from here,
// not from the individual files below.
//
// `InteractionRef` / `TimeRange` / `ModalForm` / `FieldSpec` are declared
// directly in this file per the File Structure Plan; the remaining types
// each live in their own file (one per design.md's "repository が返す型は
// `types/` に置く" grouping) and are re-exported below.
//
// Zero imports from `chat`, `@chat-adapter/*`, or any other Chat SDK
// package anywhere in this directory -- see each file's own comment for why.

/**
 * A platform-native UI-interaction trigger (Slack's `trigger_id`, Teams'
 * equivalent), carried opaquely so `PlatformFacade.openModal()` can use it
 * without this app's non-`platform/` layers ever seeing the Chat SDK's own
 * representation of it. Included on `PlatformEvent`'s `mention` /
 * `slash-command` / `action` kinds (platform-event.ts) and consumed by
 * `openModal(trigger: InteractionRef, ...)` (design.md, PlatformFacade
 * section). Whether a given `token` has expired is judged by the Chat SDK
 * call it is handed back to, not by a field on this type.
 */
export interface InteractionRef {
  readonly token: string;
}

/**
 * The value the `keep` command's `range` field (`FieldSpec.kind ===
 * 'time-range'`) collects, and what `PlatformFacade.fetchHistory(target,
 * range: TimeRange)` (design.md, PlatformFacade section) takes to bound the
 * conversation history to import (Requirement 5.1 / 5.2).
 */
export interface TimeRange {
  readonly since: Date;
  readonly until: Date;
}

/**
 * What `PlatformFacade.openModal(trigger, form, correlationId)` opens: a
 * title (shown as the modal's heading) plus the ordered `FieldSpec`s a
 * `CommandSet` entry declares it collects (design.md's CommandSet table).
 * The same `FieldSpec` list also drives Discord's/Mattermost's non-modal
 * fallback (a plain-text follow-up question per field), so `ModalForm`
 * itself carries nothing platform-specific.
 */
export interface ModalForm {
  readonly title: string;
  readonly fields: ReadonlyArray<FieldSpec>;
}

/**
 * The shape of one value a command collects. Both the modal's fields and
 * the wording of the non-modal follow-up question are built from this
 * (design.md's CommandSet section: "modal の部品と、聞き返しの文面が両方
 * これから決まる"). Copied verbatim from design.md's declared shape.
 */
export interface FieldSpec {
  readonly name: string;
  readonly label: string;
  readonly required: boolean;
  readonly kind: 'text' | 'multiline' | 'path' | 'time-range';
  readonly maxLength?: number;
}

export type { DistributedLock } from './distributed-lock.js';
export type { Invocation } from './invocation.js';
export type {
  HistoryMessage,
  HistoryOutcome,
  OutboundMessage,
} from './outbound-message.js';
export type {
  InstallationCredentials,
  PlatformAppConfig,
  PlatformEvent,
  PlatformEventSink,
} from './platform-event.js';
export type { Relation } from './relation.js';
export type { SecretCipher } from './secret-cipher.js';
