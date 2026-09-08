/**
 * PullTranslationSync (design.md: Components and Interfaces > Sync Tooling >
 * PullTranslationSync（CLI）). Exports each namespace x non-source language
 * combination's translations from POEditor, classifies each combination
 * against the current repository content via `DiffClassifier`, and groups
 * the results into exactly two collections per design.md's Pull Flow
 * PR-granularity invariant ("PRの粒度（不変条件）"):
 *
 *   1回のpull実行で対象になる最大12通り（namespace3×非ソース言語4）の判定結果は、
 *   必ず2本以下のPRに分ける。「訳文のみ」の組み合わせは1本のPRにまとめ、
 *   「構造変更」の組み合わせは別の1本のPRにまとめる。同一PRの中に構造変更の
 *   組み合わせを1件でも含めてはならない。
 *
 * `collectClassifications` builds exactly that grouping as data: every
 * `translation_only` combination goes into `translationOnly`, every
 * `structural` combination goes into `structural`, and `no_change`
 * combinations are excluded from both (nothing to report, not an error).
 * The two groups are modeled as *different element types*
 * (`TranslationOnlyCombination` / `StructuralCombination`) so a structural
 * result cannot be pushed into the translation-only group (or vice versa)
 * without a type error, not just a runtime check. A combination whose
 * POEditor export failed to parse as JSON (`invalid_json`) is excluded from
 * both groups too, but — unlike a read/export failure — does not abort the
 * run; it is reported separately via the result's `skipped` list (design.md
 * "Error Handling > Error Categories and Responses" > 「不正な形式の
 * exportデータ」).
 *
 * This task (3.1) builds only the export -> classify -> group step. Opening
 * the two PRs, the approval-bot flow, and the `lint:i18n` gate check are
 * task 3.2/3.3's responsibility, which will extend this file afterward
 * (design.md "PullTranslationSync（CLI）" Responsibilities & Constraints
 * lists them as this component's remaining scope).
 *
 * Follows the dependency direction SyncConfig -> PoeditorClient ->
 * PullTranslationSync (design.md "依存方向: SyncConfig → PoeditorClient →
 * PushSourceSync / PullTranslationSync"): this file reads `SYNC_TARGETS`,
 * calls `PoeditorClient`, and calls `DiffClassifier`'s `classify`, never the
 * reverse.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { classify } from './diff-classifier.ts';
import type { PoeditorApiError, PoeditorClient } from './poeditor-client.ts';
import { type NamespaceSyncEntry, SYNC_TARGETS } from './sync-config.ts';

/**
 * The 4 non-source languages this CLI pulls translations for (design.md:
 * "namespace × 非ソース言語（4言語）それぞれについて export"). en_US is
 * GROWI's source language, pushed (not pulled) by `PushSourceSync`.
 */
export const NON_SOURCE_LANGUAGES = [
  'ja_JP',
  'zh_CN',
  'fr_FR',
  'ko_KR',
] as const;

/** Injectable file-reading function, so tests can simulate a read failure without touching the real filesystem. */
export type ReadNamespaceFile = (absolutePath: string) => Promise<string>;

const defaultReadNamespaceFile: ReadNamespaceFile = (absolutePath) =>
  readFile(absolutePath, 'utf-8');

const APP_ROOT = fileURLToPath(new URL('../../', import.meta.url));

export interface CollectClassificationsOptions {
  readonly poeditorClient: PoeditorClient;
  /** Declared namespace -> POEditor project mapping. Defaults to the real `SYNC_TARGETS`. */
  readonly targets?: readonly NamespaceSyncEntry[];
  /** Non-source languages to pull. Defaults to the real `NON_SOURCE_LANGUAGES`. */
  readonly languages?: readonly string[];
  /** Injectable file reader for the "before" (currently committed) content. Defaults to reading the real filesystem. */
  readonly readNamespaceFile?: ReadNamespaceFile;
  /**
   * Base directory the namespace-declared locale file paths are resolved
   * against (they are relative to `apps/app/`, per SyncConfig's doc
   * comment). Defaults to this file's own package root.
   */
  readonly baseDir?: string;
}

export interface TranslationOnlyCombination {
  readonly namespace: NamespaceSyncEntry['namespace'];
  readonly language: string;
  readonly changedKeys: readonly string[];
}

export interface StructuralCombination {
  readonly namespace: NamespaceSyncEntry['namespace'];
  readonly language: string;
  readonly addedKeys: readonly string[];
  readonly removedKeys: readonly string[];
}

type CombinationFailure =
  | {
      readonly namespace: NamespaceSyncEntry['namespace'];
      readonly language: string;
      readonly reason: 'read_failed';
      readonly message: string;
    }
  | {
      readonly namespace: NamespaceSyncEntry['namespace'];
      readonly language: string;
      readonly reason: 'export_failed';
      readonly error: PoeditorApiError;
    }
  | {
      readonly namespace: NamespaceSyncEntry['namespace'];
      readonly language: string;
      readonly reason: 'invalid_json';
      readonly message: string;
    };

/** The subset of `CombinationFailure` that is surfaced but does not abort the run (design.md: 「不正な形式のexportデータ」). */
type InvalidJsonFailure = Extract<
  CombinationFailure,
  { reason: 'invalid_json' }
>;

/** The subset of `CombinationFailure` that aborts the whole run (design.md: read/export failures, "いずれかの namespace で失敗したら残りの処理を中止する"). */
type AbortingFailure = Exclude<CombinationFailure, InvalidJsonFailure>;

export type CollectClassificationsResult =
  | {
      readonly ok: true;
      readonly translationOnly: readonly TranslationOnlyCombination[];
      readonly structural: readonly StructuralCombination[];
      /**
       * (namespace, language) combinations excluded from classification
       * because the POEditor export content failed to JSON.parse
       * (design.md "Error Handling > Error Categories and Responses" >
       * 「不正な形式のexportデータ」). Unlike `read_failed`/`export_failed`,
       * this does not abort the run: export is read-only and never mutates
       * the repository, so a single malformed combination is tolerated
       * rather than blocking the other (up to 11) combinations.
       */
      readonly skipped: readonly InvalidJsonFailure[];
    }
  | {
      readonly ok: false;
      readonly failures: readonly AbortingFailure[];
    };

/**
 * One (namespace, language) combination's raw before/after read, prior to
 * classification. `before`/`after` are `undefined` exactly when `failure`
 * is set, and non-undefined otherwise (never partially populated).
 */
interface CombinationInput {
  readonly namespace: NamespaceSyncEntry['namespace'];
  readonly language: string;
  readonly before?: Readonly<Record<string, unknown>>;
  readonly after?: Readonly<Record<string, unknown>>;
  readonly failure?: CombinationFailure;
}

const safeJsonParse = (
  namespace: NamespaceSyncEntry['namespace'],
  language: string,
  content: string,
):
  | { value: Readonly<Record<string, unknown>> }
  | { failure: CombinationFailure } => {
  try {
    return { value: JSON.parse(content) as Readonly<Record<string, unknown>> };
  } catch (error) {
    return {
      failure: {
        namespace,
        language,
        reason: 'invalid_json',
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
};

/**
 * Reads the "before" (currently committed) content and exports the "after"
 * (POEditor) content for a single (namespace, language) combination. Reads
 * and the export call run concurrently since they are independent I/O
 * operations on unrelated systems; only `PoeditorClient.uploadTerms`
 * (a different method, used by `PushSourceSync`) is subject to POEditor's
 * upload rate limit — `exportTranslations` is not (design.md's throttle note
 * is scoped to uploads).
 */
interface ReadCombinationOptions {
  readonly target: NamespaceSyncEntry;
  readonly language: string;
  readonly readNamespaceFile: ReadNamespaceFile;
  readonly poeditorClient: PoeditorClient;
  readonly baseDir: string;
}

const readCombination = async ({
  target,
  language,
  readNamespaceFile,
  poeditorClient,
  baseDir,
}: ReadCombinationOptions): Promise<CombinationInput> => {
  const { namespace } = target;
  const absolutePath = path.join(baseDir, target.localeFilePath(language));

  const [beforeResult, afterResult] = await Promise.all([
    readNamespaceFile(absolutePath)
      .then((content) => ({ content }))
      .catch((error: unknown) => ({
        failure: {
          namespace,
          language,
          reason: 'read_failed' as const,
          message: error instanceof Error ? error.message : String(error),
        },
      })),
    poeditorClient.exportTranslations({
      projectId: target.poeditorProjectId,
      language,
    }),
  ]);

  if ('failure' in beforeResult) {
    return { namespace, language, failure: beforeResult.failure };
  }
  if (!afterResult.ok) {
    return {
      namespace,
      language,
      failure: {
        namespace,
        language,
        reason: 'export_failed',
        error: afterResult.error,
      },
    };
  }

  const beforeParsed = safeJsonParse(namespace, language, beforeResult.content);
  if ('failure' in beforeParsed) {
    return { namespace, language, failure: beforeParsed.failure };
  }
  const afterParsed = safeJsonParse(namespace, language, afterResult.value);
  if ('failure' in afterParsed) {
    return { namespace, language, failure: afterParsed.failure };
  }

  return {
    namespace,
    language,
    before: beforeParsed.value,
    after: afterParsed.value,
  };
};

/**
 * For every (namespace, language) combination, reads the current repository
 * content and exports the POEditor content, classifies the pair via
 * `DiffClassifier.classify`, then groups the classified combinations into
 * `translationOnly` / `structural` (design.md's PR-granularity invariant —
 * see this file's header comment).
 *
 * Mirrors `PushSourceSync.runPush`'s all-or-nothing error handling
 * (`PoeditorClient`'s Invariants, design.md: "いずれかの namespace で失敗し
 * たら残りの処理を中止する", Requirement 8.1): if any combination fails to
 * read the current repository file (`read_failed`) or export from POEditor
 * (`export_failed`), the whole run reports failure and no grouping is
 * returned, so a later task can never build a PR out of a partial result.
 *
 * `invalid_json` (the exported content fails to `JSON.parse`) is the one
 * exception, per design.md's "不正な形式のexportデータ" bullet: export is
 * read-only and never mutates the repository, so it tolerates a single
 * malformed combination rather than aborting. That combination alone is
 * excluded from `translationOnly`/`structural` and reported via `skipped`;
 * the rest of the run proceeds and groups normally.
 */
export const collectClassifications = async (
  options: CollectClassificationsOptions,
): Promise<CollectClassificationsResult> => {
  const targets = options.targets ?? SYNC_TARGETS;
  const languages = options.languages ?? NON_SOURCE_LANGUAGES;
  const readNamespaceFile =
    options.readNamespaceFile ?? defaultReadNamespaceFile;
  const baseDir = options.baseDir ?? APP_ROOT;

  const combinationInputs = await Promise.all(
    targets.flatMap((target) =>
      languages.map((language) =>
        readCombination({
          target,
          language,
          readNamespaceFile,
          poeditorClient: options.poeditorClient,
          baseDir,
        }),
      ),
    ),
  );

  // `read_failed` / `export_failed` still abort the whole run (unchanged —
  // design.md's general "いずれかの namespace で失敗したら残りの処理を中止
  // する" rule). `invalid_json` is handled separately below: per design.md's
  // 「不正な形式のexportデータ」 bullet, it only excludes its own
  // combination and lets the others continue.
  const abortingFailures = combinationInputs
    .map((input) => input.failure)
    .filter(
      (failure): failure is AbortingFailure =>
        failure != null && failure.reason !== 'invalid_json',
    );

  if (abortingFailures.length > 0) {
    return { ok: false, failures: abortingFailures };
  }

  const skipped = combinationInputs
    .map((input) => input.failure)
    .filter(
      (failure): failure is InvalidJsonFailure =>
        failure != null && failure.reason === 'invalid_json',
    );

  const translationOnly: TranslationOnlyCombination[] = [];
  const structural: StructuralCombination[] = [];

  for (const input of combinationInputs) {
    // invalid_json combinations were excluded above (surfaced via
    // `skipped`) and never reach classification.
    if (input.failure != null) {
      continue;
    }
    // Safe: every input reaching this point has neither an aborting failure
    // (checked above) nor an invalid_json failure (skipped above), so
    // before/after are guaranteed populated.
    const before = input.before as Readonly<Record<string, unknown>>;
    const after = input.after as Readonly<Record<string, unknown>>;
    const result = classify({ before, after });

    if (result.kind === 'translation_only') {
      translationOnly.push({
        namespace: input.namespace,
        language: input.language,
        changedKeys: result.changedKeys,
      });
      continue;
    }
    if (result.kind === 'structural') {
      structural.push({
        namespace: input.namespace,
        language: input.language,
        addedKeys: result.addedKeys,
        removedKeys: result.removedKeys,
      });
    }
    // 'no_change' combinations are intentionally excluded from both groups —
    // there is nothing to report for them (design.md: "no_change（変更なし）
    // の組み合わせのみだった場合は何もしない").
  }

  return { ok: true, translationOnly, structural, skipped };
};
