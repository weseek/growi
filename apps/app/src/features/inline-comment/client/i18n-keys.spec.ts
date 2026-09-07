import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Task 1.3 of inline-comment-visual-consistency (Requirement 11.6) adds the
 * translation keys the visual-consistency rework's JSX will call via
 * `t('inline_comment.*')` (start-comment button, resolved/unresolved badge,
 * resolve/reopen toggle, and the type-label row shown in the shared comment
 * card). This repo is English-first (see project memory): only `en_US` is
 * required for now, other locales are deferred.
 *
 * Task 1.3 of inline-comment-interaction-ux (Requirements 2.3, 3.2) adds two
 * more keys ahead of the components that will consume them (tasks 3.2, 4.1):
 * the placeholder for the popover's simple reply textarea, and the toast
 * shown when a list item's scroll-to-range fails because the comment's
 * anchor could not be re-resolved. The popover's submit button (task 3.2)
 * is left to follow the existing `page_comment.comment` submit-button
 * convention, as `CommentEditor.tsx` and `InlineCommentForm.tsx` already do;
 * `page_comment.reply` is a different key, reused only by task 4.1's
 * list-side "Reply..." toggle button per design.md 決定5. The popover's
 * close affordance reuses the existing top-level `Close` key. None of these
 * reused keys are duplicated here.
 */

const INLINE_COMMENT_KEYS = [
  'start_comment',
  'resolved',
  'unresolved',
  'resolve',
  'reopen',
  'label',
  'reply_placeholder',
  'range_not_found',
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
