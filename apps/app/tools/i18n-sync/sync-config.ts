/**
 * SyncConfig (design.md: Components and Interfaces > Sync Tooling >
 * SyncConfig). The single source of truth for the namespace <-> POEditor
 * project ID mapping, and for resolving a namespace's locale file path.
 *
 * `PushSourceSync` / `PullTranslationSync` read `SYNC_TARGETS` and never
 * hard-code a namespace name or project ID themselves (coding-style.md's
 * Executor pattern: executors take their work-set as input).
 *
 * This module has no dependencies on any other component in this feature —
 * it is the base of the dependency chain (design.md: "依存方向: SyncConfig
 * -> PoeditorClient -> PushSourceSync / PullTranslationSync").
 */

export interface NamespaceSyncEntry {
  readonly namespace: 'admin' | 'translation' | 'commons';
  /**
   * POEditor project ID for this namespace's dedicated project (design.md:
   * "namespace ごとに POEditor プロジェクトを1つ割り当てる"). Public,
   * non-secret data — safe to commit (design.md State Management: "POEditor
   * プロジェクトIDは公開してよい情報（トークンではない）").
   *
   * Note (POEditor provisioning, tracked as a separate operational task —
   * design.md "Operational Prerequisites"): these are placeholder values.
   * The 3 POEditor projects have not been created yet, so no real project
   * ID exists. Replace with the real IDs once
   * `docs/i18n-community-translation-setup.md`'s provisioning steps run.
   */
  readonly poeditorProjectId: string;
  /**
   * Resolves this namespace's locale file path for a given language,
   * relative to the apps/app root (e.g. "en_US" ->
   * "public/static/locales/en_US/admin.json").
   */
  readonly localeFilePath: (lang: string) => string;
}

const buildLocaleFilePath = (
  namespace: NamespaceSyncEntry['namespace'],
): NamespaceSyncEntry['localeFilePath'] => {
  return (lang: string) => `public/static/locales/${lang}/${namespace}.json`;
};

/**
 * The 3 real namespaces the repository has locale files for
 * (`admin.json` / `translation.json` / `commons.json`), each mapped to its
 * own POEditor project (Requirement 2.1). `translation` is included here,
 * which is what carries `packages/editor`'s `toolbar.*` keys into the same
 * sync range as the rest of apps/app's translation keys (Requirement 6.1) —
 * those keys already live inside `translation.json`, so no separate
 * declaration is needed for them.
 */
export const SYNC_TARGETS: readonly NamespaceSyncEntry[] = [
  {
    namespace: 'admin',
    poeditorProjectId: 'PENDING_ADMIN_PROJECT_ID',
    localeFilePath: buildLocaleFilePath('admin'),
  },
  {
    namespace: 'translation',
    poeditorProjectId: 'PENDING_TRANSLATION_PROJECT_ID',
    localeFilePath: buildLocaleFilePath('translation'),
  },
  {
    namespace: 'commons',
    poeditorProjectId: 'PENDING_COMMONS_PROJECT_ID',
    localeFilePath: buildLocaleFilePath('commons'),
  },
];
