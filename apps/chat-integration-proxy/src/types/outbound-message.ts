// `OutboundMessage` / `HistoryOutcome` / `HistoryMessage` are three of the
// `PlatformFacade`'s seven boundary types (design.md's Invariants for
// `PlatformFacade`): "platform 層の出入口に Chat SDK の型を含めない" --
// carrying zero Chat SDK types here is what lets the task-1.7 lint rule
// (forbid `chat` / `@chat-adapter/*` imports outside `platform/**`) hold
// without an exception.
//
// `OutboundMessage` is deliberately proxy-owned vocabulary, not a Chat SDK
// Card: "Card への変換は platform/outbound.ts の中だけで行う。ここに SDK
// の型が入ると、組み立てる orchestration/ が SDK を import することになり、
// 決定 2 の lint に例外が要る" (design.md, PlatformFacade section). The three
// variants below are exactly design.md's declared shape.
import type { ChatAccountRef } from '@growi/chat';

export type OutboundMessage =
  | { readonly kind: 'markdown'; readonly markdown: string }
  | {
      readonly kind: 'list';
      readonly title: string;
      readonly rows: ReadonlyArray<{
        readonly markdown: string;
        readonly sourceLabel: string;
      }>;
      readonly footer?: string;
    }
  | {
      readonly kind: 'choice';
      readonly prompt: string;
      readonly options: ReadonlyArray<{
        readonly id: string;
        readonly label: string;
      }>;
    };

/**
 * `PlatformFacade.fetchHistory()`'s result. `not-in-channel` / `not-permitted`
 * / `unsupported` cover Requirement 5.4 (bot cannot read this channel's
 * history) and 5.6 (this chat service does not support history at all).
 */
export type HistoryOutcome =
  | { readonly ok: true; readonly messages: ReadonlyArray<HistoryMessage> }
  | {
      readonly ok: false;
      readonly reason: 'not-in-channel' | 'not-permitted' | 'unsupported';
      readonly remedy: string;
    };

/**
 * One message `fetchHistory` returns. Converted into a `KeepMessage`
 * (`@growi/chat`'s contract) before being sent to GROWI -- see design.md's
 * comment on this exact interface.
 */
export interface HistoryMessage {
  readonly postedAt: string;
  readonly author: ChatAccountRef;
  readonly text: string;
}
