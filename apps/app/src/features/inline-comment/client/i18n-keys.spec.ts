import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Task 1.3 of inline-comment-visual-consistency (Requirement 11.6) adds the
 * translation keys the visual-consistency rework's JSX will call via
 * `t('inline_comment.*')` (start-comment button, resolved/unresolved badge,
 * resolve/reopen toggle, and the type-label row shown in the shared comment
 * card). This repo is English-first (see project memory): only `en_US` is
 * required for now, other locales are deferred.
 */

const INLINE_COMMENT_KEYS = [
  'start_comment',
  'resolved',
  'unresolved',
  'resolve',
  'reopen',
  'label',
] as const;

const translationJsonPath = path.resolve(
  import.meta.dirname,
  '../../../../public/static/locales/en_US/translation.json',
);

describe('en_US translation.json has the inline_comment.* keys', () => {
  const translation = JSON.parse(
    fs.readFileSync(translationJsonPath, 'utf-8'),
  ) as Record<string, unknown>;

  it.each(
    INLINE_COMMENT_KEYS,
  )('inline_comment.%s resolves to a non-empty string', (key) => {
    const namespace = translation.inline_comment as
      | Record<string, unknown>
      | undefined;
    const value = namespace?.[key];

    expect(typeof value).toBe('string');
    expect((value as string).trim().length).toBeGreaterThan(0);
  });

  it('inline_comment.label is exactly "Inline Comment" (design.md 決定6)', () => {
    const namespace = translation.inline_comment as
      | Record<string, unknown>
      | undefined;
    expect(namespace?.label).toBe('Inline Comment');
  });
});
