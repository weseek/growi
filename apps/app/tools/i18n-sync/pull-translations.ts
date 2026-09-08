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
 * `applyTranslationOnlyChanges` then takes the `translationOnly` group and
 * carries it all the way to an approved, auto-mergeable PR (design.md
 * "PullTranslationSync（CLI）" Responsibilities & Constraints). The
 * `structural` group's review-required PR remains task 3.3's scope.
 *
 * Follows the dependency direction SyncConfig -> PoeditorClient ->
 * PullTranslationSync (design.md "依存方向: SyncConfig → PoeditorClient →
 * PushSourceSync / PullTranslationSync"): this file reads `SYNC_TARGETS`,
 * calls `PoeditorClient`, and calls `DiffClassifier`'s `classify`, never the
 * reverse.
 */

import { readFile, writeFile } from 'node:fs/promises';
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
  /**
   * The locale file this combination's `before` content was read from — the
   * same absolute path `applyTranslationOnlyChanges` writes back to, so the
   * file that gets overwritten is provably the file that was classified.
   */
  readonly absoluteFilePath: string;
  /**
   * The exported POEditor content exactly as `DiffClassifier` saw it.
   *
   * Carrying it here (rather than re-exporting at apply time) is a
   * correctness requirement, not an optimization: POEditor is a live system
   * where a contributor can add or remove a term at any moment, so a second
   * export could return content with a *different* key set than the one
   * classified as `translation_only` — and that content would then take the
   * auto-merge path with no human review, breaking design.md's PR-granularity
   * invariant and Requirement 3.2.
   */
  readonly content: Readonly<Record<string, unknown>>;
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
  /** Absolute path of the locale file `before` was read from. */
  readonly absoluteFilePath: string;
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
    return {
      namespace,
      language,
      absoluteFilePath: absolutePath,
      failure: beforeResult.failure,
    };
  }
  if (!afterResult.ok) {
    return {
      namespace,
      language,
      absoluteFilePath: absolutePath,
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
    return {
      namespace,
      language,
      absoluteFilePath: absolutePath,
      failure: beforeParsed.failure,
    };
  }
  const afterParsed = safeJsonParse(namespace, language, afterResult.value);
  if ('failure' in afterParsed) {
    return {
      namespace,
      language,
      absoluteFilePath: absolutePath,
      failure: afterParsed.failure,
    };
  }

  return {
    namespace,
    language,
    absoluteFilePath: absolutePath,
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
        absoluteFilePath: input.absoluteFilePath,
        content: after,
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

/**
 * The single branch every translation-only sync run converges onto.
 *
 * A fixed name (rather than one derived from the diff's content) is what
 * makes the "no duplicate PRs" property hold by construction: each run
 * rewrites this branch to the current POEditor state, so at most one
 * translation-only PR can ever be open. It is the same reasoning as
 * `sync_terms=1` on the push side — the operation converges to the current
 * state instead of accumulating one artifact per run (design.md
 * PullTranslationSync Batch Contract: 「既存の未マージPRがあれば更新する
 * （重複PRを作らない）」).
 */
export const TRANSLATION_ONLY_BRANCH = 'i18n-sync/translation-only';

/** Injectable file-writing function, mirroring `ReadNamespaceFile`. */
export type WriteLocaleFile = (
  absolutePath: string,
  content: string,
) => Promise<void>;

const defaultWriteLocaleFile: WriteLocaleFile = (absolutePath, content) =>
  writeFile(absolutePath, content, 'utf-8');

/** Identifies one pull request on the repository. */
export interface PullRequestRef {
  readonly number: number;
}

/**
 * Everything the translation-only path needs to turn locally-written locale
 * files into an open pull request. Deliberately kept separate from
 * `ApprovalReviewer`: the two are performed by *different* GitHub identities
 * (GitHub refuses a self-approval), and the approving identity is scoped to
 * `pull-requests: write` with no content-write permission at all (design.md
 * Security Considerations, `I18N_SYNC_APPROVAL_TOKEN`). Splitting the
 * interfaces makes that separation structural rather than a convention: an
 * implementation of `ApprovalReviewer` is handed no method that could write
 * repository content.
 */
export interface TranslationOnlyPrPublisher {
  /**
   * Commits the locale files at `filePaths` onto `headBranch` and pushes it.
   *
   * An implementation must stage **only** those paths — never the whole
   * working tree. A single pull run classifies both groups against the same
   * checkout, so the structural group's locale files can already be modified
   * alongside these; sweeping them in would put a structural change into the
   * translation-only pull request and merge it with no human review, which
   * design.md forbids outright (「同一PRの中に構造変更の組み合わせを1件でも
   * 含めてはならない」, Requirement 3.2).
   */
  publishBranch(input: {
    readonly headBranch: string;
    readonly commitMessage: string;
    readonly filePaths: readonly string[];
  }): Promise<void>;
  /** The open, unmerged pull request for `headBranch`, or `null` if there is none. */
  findExistingPr(input: {
    readonly headBranch: string;
  }): Promise<PullRequestRef | null>;
  createPr(input: {
    readonly headBranch: string;
    readonly title: string;
    readonly body: string;
  }): Promise<PullRequestRef>;
  updatePr(input: {
    readonly pullRequest: PullRequestRef;
    readonly body: string;
  }): Promise<void>;
}

/** Submits the approving review, under an identity distinct from the PR's author. */
export interface ApprovalReviewer {
  submitApprovalReview(input: {
    readonly pullRequest: PullRequestRef;
  }): Promise<void>;
}

export type LintGateResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string };

/**
 * The existing i18n CI gate (`pnpm run lint:i18n` /
 * `apps/app/tools/i18n-audit/`). design.md's Out of Boundary is explicit that
 * this feature only *calls* the gate and never touches its detection logic,
 * so it enters here as an injected collaborator rather than as a direct
 * dependency on the audit tooling.
 */
export interface I18nLintGate {
  run(): Promise<LintGateResult>;
}

export interface ApplyTranslationOnlyChangesOptions {
  /** The `translationOnly` group produced by `collectClassifications`. */
  readonly combinations: readonly TranslationOnlyCombination[];
  readonly prPublisher: TranslationOnlyPrPublisher;
  readonly approvalReviewer: ApprovalReviewer;
  readonly lintGate: I18nLintGate;
  /** Injectable file writer. Defaults to writing the real filesystem. */
  readonly writeLocaleFile?: WriteLocaleFile;
}

export type ApplyTranslationOnlyChangesResult =
  | { readonly ok: true; readonly outcome: 'no_changes' }
  | {
      readonly ok: true;
      readonly outcome: 'approved';
      readonly pullRequest: PullRequestRef;
      /** `true` when this run opened the PR, `false` when it updated an already-open one. */
      readonly created: boolean;
    }
  | {
      readonly ok: false;
      readonly reason: 'lint_gate_failed';
      /** The PR that carries the failing check, left open for maintainers to inspect. */
      readonly pullRequest: PullRequestRef;
      readonly message: string;
    };

/**
 * Serializes a locale file the way the repository's own locale files are
 * formatted: 2-space indent with a trailing newline.
 */
const serializeLocaleFile = (
  content: Readonly<Record<string, unknown>>,
): string => `${JSON.stringify(content, null, 2)}\n`;

const buildPrBody = (
  combinations: readonly TranslationOnlyCombination[],
): string => {
  const lines = combinations.map(
    (combination) =>
      `- \`${combination.namespace}\` / \`${combination.language}\`: ${combination.changedKeys.length} key(s) retranslated`,
  );
  return [
    'Translations pulled from POEditor. Every combination below changes only the',
    'values of existing keys — the leaf key set is identical before and after —',
    'so this pull request takes the automatic path and is approved by the sync',
    'bot once `lint:i18n` passes.',
    '',
    ...lines,
  ].join('\n');
};

const PR_TITLE = 'chore(i18n): apply translation-only updates from POEditor';

/**
 * Applies the `translation_only` group: writes each combination's exported
 * content to its locale file, gathers them into a *single* pull request, runs
 * the existing i18n CI gate, and — only if the gate passes — has the approval
 * bot submit an approving review (Requirements 3.3, 3.4, 8.1).
 *
 * **Why approving is enough, and why it does not bypass CI.** The approving
 * review only satisfies the `#approved-reviews-by >= 1` condition of the
 * existing `.github/mergify.yml` rule "Automatic queue to merge", which
 * merely puts the PR into the merge queue. The queue's own `queue_rules`
 * independently require `check-success ~= ci-app-lint` (which contains
 * `lint:i18n`) before anything merges. So the gate is applied twice and is
 * never circumvented, exactly as Requirement 3.4 demands — this file adds no
 * new merge route and changes no Mergify rule.
 *
 * **Step order is load-bearing, not incidental.** The gate reads the locale
 * files from disk, so it must run *after* they are written; and design.md's
 * Error Handling requires a failing gate to remain visible 「失敗したチェック
 * として残す」, which needs a pull request to carry that check. Hence:
 * write → publish branch → create-or-update the PR → run the gate → approve.
 *
 * **Why writing whole files is safe.** `translation_only` means the two leaf
 * key sets are identical, so overwriting the file with the exported content
 * can only change values, never the key set — the property that makes this
 * change eligible for the no-human-review path in the first place.
 *
 * On a gate failure nothing is approved and the PR is deliberately left open
 * with its failing check; the failure is returned so the caller can fail the
 * workflow (Requirement 8.1).
 */
export const applyTranslationOnlyChanges = async (
  options: ApplyTranslationOnlyChangesOptions,
): Promise<ApplyTranslationOnlyChangesResult> => {
  const { combinations, prPublisher, approvalReviewer, lintGate } = options;
  const writeLocaleFile = options.writeLocaleFile ?? defaultWriteLocaleFile;

  if (combinations.length === 0) {
    // Nothing to propose: opening an empty pull request (and paying for a
    // gate run on it) would be pure noise (design.md: 「no_change（変更なし）
    // の組み合わせのみだった場合は何もしない」).
    return { ok: true, outcome: 'no_changes' };
  }

  const filePaths = combinations.map(
    (combination) => combination.absoluteFilePath,
  );

  await Promise.all(
    combinations.map((combination) =>
      writeLocaleFile(
        combination.absoluteFilePath,
        serializeLocaleFile(combination.content),
      ),
    ),
  );

  await prPublisher.publishBranch({
    headBranch: TRANSLATION_ONLY_BRANCH,
    commitMessage: PR_TITLE,
    // Only this group's files: see publishBranch's contract for why staging
    // anything else would break the PR-granularity invariant.
    filePaths,
  });

  const body = buildPrBody(combinations);
  const existingPr = await prPublisher.findExistingPr({
    headBranch: TRANSLATION_ONLY_BRANCH,
  });

  let pullRequest: PullRequestRef;
  let created: boolean;
  if (existingPr != null) {
    await prPublisher.updatePr({ pullRequest: existingPr, body });
    pullRequest = existingPr;
    created = false;
  } else {
    pullRequest = await prPublisher.createPr({
      headBranch: TRANSLATION_ONLY_BRANCH,
      title: PR_TITLE,
      body,
    });
    created = true;
  }

  const gateResult = await lintGate.run();
  if (!gateResult.ok) {
    return {
      ok: false,
      reason: 'lint_gate_failed',
      pullRequest,
      message: gateResult.message,
    };
  }

  await approvalReviewer.submitApprovalReview({ pullRequest });

  return { ok: true, outcome: 'approved', pullRequest, created };
};
