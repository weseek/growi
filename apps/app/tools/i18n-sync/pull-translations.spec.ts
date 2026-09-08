import { mock } from 'vitest-mock-extended';

import type { PoeditorClient } from './poeditor-client.ts';
import { collectClassifications } from './pull-translations.ts';
import type { NamespaceSyncEntry } from './sync-config.ts';

// A small 3-entry fixture mirroring the shape of the real SYNC_TARGETS
// (admin/translation/commons), injected via `targets` so this test never
// depends on the real POEditor project IDs declared in sync-config.ts.
const TEST_TARGETS: readonly NamespaceSyncEntry[] = [
  {
    namespace: 'admin',
    poeditorProjectId: 'project-admin',
    localeFilePath: (lang) => `locales/${lang}/admin.json`,
  },
  {
    namespace: 'translation',
    poeditorProjectId: 'project-translation',
    localeFilePath: (lang) => `locales/${lang}/translation.json`,
  },
  {
    namespace: 'commons',
    poeditorProjectId: 'project-commons',
    localeFilePath: (lang) => `locales/${lang}/commons.json`,
  },
];

const TEST_LANGUAGES = ['ja_JP', 'zh_CN', 'fr_FR', 'ko_KR'] as const;

// "before" (currently committed) content per namespace, keyed by
// `/base/locales/<lang>/<namespace>.json` -- identical across all 4
// languages for a given namespace, mirroring how a real locale file only
// differs from language to language in its values, not its base shape.
const BEFORE_BY_NAMESPACE: Readonly<Record<string, string>> = {
  admin: '{"k1":"v1","k2":"v2"}',
  translation: '{"t1":"a","t2":"b"}',
  commons: '{"c1":"a","c2":"b"}',
};

// "after" (POEditor export) content per namespace+language, deliberately
// mixing all 3 classification kinds across the 12 combinations:
//   translation_only: admin/ja_JP, admin/ko_KR, translation/zh_CN,
//                      commons/zh_CN, commons/ko_KR
//   structural:        admin/zh_CN, translation/ja_JP, translation/fr_FR,
//                      commons/fr_FR
//   no_change:         admin/fr_FR, translation/ko_KR, commons/ja_JP
const AFTER_BY_NAMESPACE_LANGUAGE: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  admin: {
    ja_JP: '{"k1":"CHANGED","k2":"v2"}', // translation_only
    zh_CN: '{"k1":"v1","k3":"v3"}', // structural (removed k2, added k3)
    fr_FR: '{"k1":"v1","k2":"v2"}', // no_change
    ko_KR: '{"k1":"v1","k2":"CHANGED"}', // translation_only
  },
  translation: {
    ja_JP: '{"t1":"a","t2":"b","t3":"c"}', // structural (added t3)
    zh_CN: '{"t1":"CHANGED","t2":"b"}', // translation_only
    fr_FR: '{"t2":"b"}', // structural (removed t1)
    ko_KR: '{"t1":"a","t2":"b"}', // no_change
  },
  commons: {
    ja_JP: '{"c1":"a","c2":"b"}', // no_change
    zh_CN: '{"c1":"CHANGED","c2":"b"}', // translation_only
    fr_FR: '{"c1":"a"}', // structural (removed c2)
    ko_KR: '{"c1":"a","c2":"CHANGED"}', // translation_only
  },
};

const PROJECT_ID_TO_NAMESPACE: Readonly<Record<string, string>> = {
  'project-admin': 'admin',
  'project-translation': 'translation',
  'project-commons': 'commons',
};

/** Builds a poeditorClient double whose exportTranslations resolves per (projectId, language) from AFTER_BY_NAMESPACE_LANGUAGE. */
const buildPoeditorClient = (): PoeditorClient => {
  const poeditorClient = mock<PoeditorClient>();
  poeditorClient.exportTranslations.mockImplementation(
    // biome-ignore lint/suspicious/useAwait: must match PoeditorClient's Promise-returning signature.
    async ({ projectId, language }) => {
      const namespace = PROJECT_ID_TO_NAMESPACE[projectId];
      const content = AFTER_BY_NAMESPACE_LANGUAGE[namespace]?.[language];
      if (content == null) {
        throw new Error(`no fixture for ${projectId}/${language}`);
      }
      return { ok: true, value: content };
    },
  );
  return poeditorClient;
};

const buildReadNamespaceFile = () =>
  // biome-ignore lint/suspicious/useAwait: must match ReadNamespaceFile's Promise-returning signature.
  vi.fn(async (absolutePath: string) => {
    const match = /\/base\/locales\/[^/]+\/(\w+)\.json$/.exec(absolutePath);
    const namespace = match?.[1];
    const content =
      namespace != null ? BEFORE_BY_NAMESPACE[namespace] : undefined;
    if (content == null) {
      throw new Error(`no fixture for ${absolutePath}`);
    }
    return content;
  });

describe('collectClassifications', () => {
  it('reads and exports all 3 namespace x 4 language combinations (12 total) and classifies each', async () => {
    const poeditorClient = buildPoeditorClient();
    const readNamespaceFile = buildReadNamespaceFile();

    const result = await collectClassifications({
      poeditorClient,
      targets: TEST_TARGETS,
      languages: TEST_LANGUAGES,
      readNamespaceFile,
      baseDir: '/base',
    });

    expect(result.ok).toBe(true);
    expect(poeditorClient.exportTranslations).toHaveBeenCalledTimes(12);
    expect(readNamespaceFile).toHaveBeenCalledTimes(12);
  });

  it('separates translation_only and structural combinations into two disjoint groups with no mixing, from a 12-combination input mixing all 3 classification kinds', async () => {
    // This is the task's named critical invariant test (design.md's
    // PR-granularity invariant): a real pull run mixes no_change,
    // translation_only, and structural results across the 12 combinations,
    // and the two output groups must never let a structural result leak
    // into the translationOnly group (or vice versa) -- doing so would let
    // a structural, key-adding-or-removing change auto-merge via the
    // translation_only PR's no-human-review path, silently breaking
    // Requirement 3.2.
    const poeditorClient = buildPoeditorClient();
    const readNamespaceFile = buildReadNamespaceFile();

    const result = await collectClassifications({
      poeditorClient,
      targets: TEST_TARGETS,
      languages: TEST_LANGUAGES,
      readNamespaceFile,
      baseDir: '/base',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    // Exact membership of each group, keyed by namespace/language only (not
    // asserting on changedKeys/addedKeys/removedKeys here -- covered below).
    const translationOnlyKeys = result.translationOnly
      .map((c) => `${c.namespace}/${c.language}`)
      .sort();
    const structuralKeys = result.structural
      .map((c) => `${c.namespace}/${c.language}`)
      .sort();

    expect(translationOnlyKeys).toEqual(
      [
        'admin/ja_JP',
        'admin/ko_KR',
        'commons/ko_KR',
        'commons/zh_CN',
        'translation/zh_CN',
      ].sort(),
    );
    expect(structuralKeys).toEqual(
      [
        'admin/zh_CN',
        'commons/fr_FR',
        'translation/fr_FR',
        'translation/ja_JP',
      ].sort(),
    );

    // no_change combinations (admin/fr_FR, translation/ko_KR, commons/ja_JP)
    // must appear in neither group.
    const allReported = [...translationOnlyKeys, ...structuralKeys];
    expect(allReported).not.toContain('admin/fr_FR');
    expect(allReported).not.toContain('translation/ko_KR');
    expect(allReported).not.toContain('commons/ja_JP');
    expect(allReported).toHaveLength(9);

    // The airtight form of the invariant: every single element actually
    // classified as `structural` by DiffClassifier must be absent from the
    // translationOnly group's list, checked one-by-one rather than just by
    // group size/non-emptiness. If the grouping logic were buggy -- e.g. it
    // accidentally pushed every result into one array, or mislabeled a
    // structural result as translation_only -- this loop is what would
    // catch it (a bare "both groups are non-empty" assertion would not).
    for (const key of structuralKeys) {
      expect(translationOnlyKeys).not.toContain(key);
    }
    for (const key of translationOnlyKeys) {
      expect(structuralKeys).not.toContain(key);
    }

    // Spot-check the classification payload itself is the real,
    // kind-appropriate shape (not a stub), confirming the grouping
    // consumed DiffClassifier's actual result rather than a hand-built one.
    const adminZhCn = result.structural.find(
      (c) => c.namespace === 'admin' && c.language === 'zh_CN',
    );
    expect(adminZhCn).toEqual({
      namespace: 'admin',
      language: 'zh_CN',
      addedKeys: ['k3'],
      removedKeys: ['k2'],
    });

    const adminJaJp = result.translationOnly.find(
      (c) => c.namespace === 'admin' && c.language === 'ja_JP',
    );
    expect(adminJaJp).toEqual({
      namespace: 'admin',
      language: 'ja_JP',
      changedKeys: ['k1'],
    });
  });

  it('excludes no_change combinations from both groups without treating them as an error', async () => {
    const poeditorClient = mock<PoeditorClient>();
    poeditorClient.exportTranslations.mockResolvedValue({
      ok: true,
      value: '{"only_key":"same"}',
    });
    const readNamespaceFile = vi.fn(async () => '{"only_key":"same"}');

    const result = await collectClassifications({
      poeditorClient,
      targets: TEST_TARGETS,
      languages: TEST_LANGUAGES,
      readNamespaceFile,
      baseDir: '/base',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.translationOnly).toEqual([]);
      expect(result.structural).toEqual([]);
    }
  });

  it('aborts the whole run (reports failure, no grouping) when one combination fails to read', async () => {
    const poeditorClient = buildPoeditorClient();
    // biome-ignore lint/suspicious/useAwait: must match ReadNamespaceFile's Promise-returning signature.
    const readNamespaceFile = vi.fn(async (absolutePath: string) => {
      if (absolutePath === '/base/locales/ja_JP/admin.json') {
        throw new Error('ENOENT: no such file or directory');
      }
      const match = /\/base\/locales\/[^/]+\/(\w+)\.json$/.exec(absolutePath);
      const namespace = match?.[1] as string;
      return BEFORE_BY_NAMESPACE[namespace];
    });

    const result = await collectClassifications({
      poeditorClient,
      targets: TEST_TARGETS,
      languages: TEST_LANGUAGES,
      readNamespaceFile,
      baseDir: '/base',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures).toEqual([
        {
          namespace: 'admin',
          language: 'ja_JP',
          reason: 'read_failed',
          message: 'ENOENT: no such file or directory',
        },
      ]);
    }
  });

  it('aborts the whole run (reports failure, no grouping) when one combination fails to export from POEditor', async () => {
    const poeditorClient = mock<PoeditorClient>();
    poeditorClient.exportTranslations.mockImplementation(
      // biome-ignore lint/suspicious/useAwait: must match PoeditorClient's Promise-returning signature.
      async ({ projectId, language }) => {
        if (projectId === 'project-translation' && language === 'zh_CN') {
          return { ok: false, error: { type: 'rate_limited' } };
        }
        const namespace = PROJECT_ID_TO_NAMESPACE[projectId];
        const content = AFTER_BY_NAMESPACE_LANGUAGE[namespace]?.[language];
        return { ok: true, value: content ?? '{}' };
      },
    );
    const readNamespaceFile = buildReadNamespaceFile();

    const result = await collectClassifications({
      poeditorClient,
      targets: TEST_TARGETS,
      languages: TEST_LANGUAGES,
      readNamespaceFile,
      baseDir: '/base',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures).toEqual([
        {
          namespace: 'translation',
          language: 'zh_CN',
          reason: 'export_failed',
          error: { type: 'rate_limited' },
        },
      ]);
    }
  });

  it('does not abort the run when one combination has invalid-JSON export content -- only that combination is skipped, the rest classify normally', async () => {
    // design.md "Error Handling > Error Categories and Responses" >
    // 「不正な形式のexportデータ」: unlike read_failed/export_failed,
    // invalid_json only excludes its own (namespace, language) combination
    // -- export is read-only, so a single malformed combination is
    // tolerated rather than aborting the whole run.
    const poeditorClient = mock<PoeditorClient>();
    poeditorClient.exportTranslations.mockImplementation(
      // biome-ignore lint/suspicious/useAwait: must match PoeditorClient's Promise-returning signature.
      async ({ projectId, language }) => {
        if (projectId === 'project-translation' && language === 'zh_CN') {
          // Malformed JSON -- triggers invalid_json, not export_failed
          // (PoeditorClient itself reports `ok: true`; the content is what's
          // broken).
          return { ok: true, value: '{not valid json' };
        }
        const namespace = PROJECT_ID_TO_NAMESPACE[projectId];
        const content = AFTER_BY_NAMESPACE_LANGUAGE[namespace]?.[language];
        return { ok: true, value: content ?? '{}' };
      },
    );
    const readNamespaceFile = buildReadNamespaceFile();

    const result = await collectClassifications({
      poeditorClient,
      targets: TEST_TARGETS,
      languages: TEST_LANGUAGES,
      readNamespaceFile,
      baseDir: '/base',
    });

    // (a) the run does not abort as a whole.
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    // (b) the other 11 combinations are still classified normally. Per the
    // fixture (see AFTER_BY_NAMESPACE_LANGUAGE), translation/zh_CN was
    // translation_only before being replaced with invalid JSON here, so the
    // expected translationOnly group loses exactly that one entry versus
    // the "separates ... into two disjoint groups" test above.
    const translationOnlyKeys = result.translationOnly
      .map((c) => `${c.namespace}/${c.language}`)
      .sort();
    const structuralKeys = result.structural
      .map((c) => `${c.namespace}/${c.language}`)
      .sort();

    expect(translationOnlyKeys).toEqual(
      ['admin/ja_JP', 'admin/ko_KR', 'commons/ko_KR', 'commons/zh_CN'].sort(),
    );
    expect(structuralKeys).toEqual(
      [
        'admin/zh_CN',
        'commons/fr_FR',
        'translation/fr_FR',
        'translation/ja_JP',
      ].sort(),
    );

    // (c) the invalid_json combination is surfaced via `skipped`, and is
    // absent from both classification groups.
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]).toMatchObject({
      namespace: 'translation',
      language: 'zh_CN',
      reason: 'invalid_json',
    });
    expect(translationOnlyKeys).not.toContain('translation/zh_CN');
    expect(structuralKeys).not.toContain('translation/zh_CN');
  });
});
