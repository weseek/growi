/**
 * PushSourceSync (design.md: Components and Interfaces > Sync Tooling >
 * PushSourceSync（CLI）). Reads the en_US (source language) locale file for
 * each namespace declared in `SyncConfig` and pushes it to that namespace's
 * POEditor project via `PoeditorClient.uploadTerms`.
 *
 * Responsibilities & constraints this file must uphold (design.md):
 * - Read every namespace file first, then upload. If any namespace file
 *   fails to read, abort the whole run and call `uploadTerms` zero times
 *   (Requirement 2.3, 8.1: no partial reflection — a namespace must never
 *   be silently skipped, and a failure must never let some namespaces sync
 *   while others don't).
 * - Upload sequentially, once per namespace declared in `SYNC_TARGETS`. The
 *   at-least-20-second gap between uploads is already enforced inside
 *   `PoeditorClient.uploadTerms` itself (its internal throttle, injectable
 *   via `sleep` for tests) — this file must not duplicate that wait.
 * - Follows the dependency direction SyncConfig -> PoeditorClient ->
 *   PushSourceSync (design.md "依存方向"): this file reads `SYNC_TARGETS`
 *   and calls `PoeditorClient`, never the reverse.
 * - The POEditor API token is read from `process.env` only in the
 *   process-entrypoint wrapper (`main`), never inside `runPush` itself, so
 *   the pure orchestration logic stays testable without touching env vars
 *   (mirrors apps/app/tools/i18n-audit/run-audit.ts's two-execution-mode
 *   pattern).
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  createPoeditorClient,
  type PoeditorApiError,
  type PoeditorClient,
} from './poeditor-client.ts';
import { type NamespaceSyncEntry, SYNC_TARGETS } from './sync-config.ts';

/** The language this CLI pushes: en_US is GROWI's source language (Requirement 2.1). */
export const SOURCE_LANGUAGE = 'en_US';

/** Injectable file-reading function, so tests can simulate a read failure without touching the real filesystem. */
export type ReadNamespaceFile = (absolutePath: string) => Promise<string>;

const defaultReadNamespaceFile: ReadNamespaceFile = (absolutePath) =>
  readFile(absolutePath, 'utf-8');

export interface RunPushOptions {
  readonly poeditorClient: PoeditorClient;
  /** Declared namespace -> POEditor project mapping. Defaults to the real `SYNC_TARGETS`. */
  readonly targets?: readonly NamespaceSyncEntry[];
  /** Injectable file reader. Defaults to reading the real filesystem. */
  readonly readNamespaceFile?: ReadNamespaceFile;
  /**
   * Base directory the namespace-declared locale file paths are resolved
   * against (they are relative to `apps/app/`, per SyncConfig's doc
   * comment). Defaults to this file's own package root.
   */
  readonly baseDir?: string;
}

type NamespaceReadFailure = {
  readonly namespace: NamespaceSyncEntry['namespace'];
  readonly filePath: string;
  readonly message: string;
};

type NamespaceUploadFailure = {
  readonly namespace: NamespaceSyncEntry['namespace'];
  readonly error: PoeditorApiError;
};

export type PushResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'read_failed';
      readonly failures: readonly NamespaceReadFailure[];
    }
  | {
      readonly ok: false;
      readonly reason: 'upload_failed';
      readonly failures: readonly NamespaceUploadFailure[];
    };

const APP_ROOT = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Reads every declared namespace's en_US file first, then uploads them all
 * sequentially. Reading everything before uploading anything is what makes
 * the "abort before any upload" guarantee (Requirement 2.3) hold cleanly:
 * there is no interleaved read+upload step where a later read failure could
 * leave an earlier namespace already pushed.
 */
export const runPush = async (options: RunPushOptions): Promise<PushResult> => {
  const targets = options.targets ?? SYNC_TARGETS;
  const readNamespaceFile =
    options.readNamespaceFile ?? defaultReadNamespaceFile;
  const baseDir = options.baseDir ?? APP_ROOT;

  const readResults = await Promise.all(
    targets.map(async (target) => {
      const filePath = target.localeFilePath(SOURCE_LANGUAGE);
      const absolutePath = path.join(baseDir, filePath);
      try {
        const fileContent = await readNamespaceFile(absolutePath);
        return { target, filePath, fileContent, error: undefined };
      } catch (error) {
        return {
          target,
          filePath,
          fileContent: undefined,
          error: error as Error,
        };
      }
    }),
  );

  const readFailures: NamespaceReadFailure[] = readResults
    .filter((result) => result.error != null)
    .map((result) => ({
      namespace: result.target.namespace,
      filePath: result.filePath,
      message: result.error?.message ?? 'unknown error',
    }));

  if (readFailures.length > 0) {
    return { ok: false, reason: 'read_failed', failures: readFailures };
  }

  // Upload sequentially and stop at the first failure. design.md's Error
  // Strategy ("一部のnamespaceで失敗した場合は残りを継続せず、ワークフロー
  // 全体を失敗として終了する") and PoeditorClient's Invariants both require
  // this to be symmetric with the read-failure path above: a namespace must
  // never be pushed while a preceding one is known to have failed, so a
  // partial reflection in POEditor (some namespaces updated, some not) can
  // never happen.
  for (const result of readResults) {
    // Safe: readFailures.length === 0 above guarantees every result has a
    // fileContent, since the only way to reach here is with zero errors.
    const fileContent = result.fileContent as string;
    // Uploads must run sequentially, not in parallel via Promise.all —
    // PoeditorClient enforces a 20-second gap between consecutive
    // uploadTerms calls (design.md), which only holds if each call starts
    // after the previous one settles.
    // biome-ignore lint/performance/noAwaitInLoops: sequential by design, see comment above.
    const uploadResult = await options.poeditorClient.uploadTerms({
      projectId: result.target.poeditorProjectId,
      language: SOURCE_LANGUAGE,
      fileContent,
    });
    if (!uploadResult.ok) {
      return {
        ok: false,
        reason: 'upload_failed',
        failures: [
          { namespace: result.target.namespace, error: uploadResult.error },
        ],
      };
    }
  }

  return { ok: true };
};

const formatFailure = (
  failure: NamespaceReadFailure | NamespaceUploadFailure,
): string => {
  if ('filePath' in failure) {
    return `  - ${failure.namespace} (${failure.filePath}): ${failure.message}`;
  }
  return `  - ${failure.namespace}: ${JSON.stringify(failure.error)}`;
};

/**
 * Process-entrypoint wrapper: reads the POEditor API token from
 * `process.env`, runs `runPush`, prints the outcome, and sets a non-zero
 * exit code on failure (Requirement 8.1 — surfaced as a GitHub Actions
 * workflow failure). Kept separate from `runPush` so the orchestration
 * logic stays testable without an env var or a real process exit.
 */
export const main = async (): Promise<void> => {
  const apiToken = process.env.POEDITOR_API_TOKEN;
  if (apiToken == null || apiToken === '') {
    // biome-ignore lint/suspicious/noConsole: this is a CI script, console output is expected.
    console.error(
      'Cannot push to POEditor: POEDITOR_API_TOKEN is not set in the environment.',
    );
    process.exitCode = 1;
    return;
  }

  const poeditorClient = createPoeditorClient({ apiToken });
  const result = await runPush({ poeditorClient });

  if (result.ok) {
    // biome-ignore lint/suspicious/noConsole: this is a CI script, console output is expected.
    console.log(
      `Pushed ${SYNC_TARGETS.length} namespace(s) of ${SOURCE_LANGUAGE} to POEditor.`,
    );
    return;
  }

  const label =
    result.reason === 'read_failed'
      ? 'Aborted: failed to read the following namespace file(s), no upload was attempted'
      : 'Failed: the following namespace(s) failed to upload to POEditor';
  // biome-ignore lint/suspicious/noConsole: this is a CI script, console output is expected.
  console.error(`${label}:\n${result.failures.map(formatFailure).join('\n')}`);
  process.exitCode = 1;
};

// Only run when executed directly (`node tools/i18n-sync/push-source.ts`),
// not when imported by tests -- otherwise importing this module for
// `runPush` would attempt to read `process.env.POEDITOR_API_TOKEN` and run
// the real entrypoint as a side effect of the import itself.
if (
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
