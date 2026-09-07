import { expect, type Page, test } from '@playwright/test';

import type { CreatedPage } from '../utils/api';
import { createPage, deletePagesCompletely, updatePage } from '../utils/api';

/**
 * Selects `text` inside the rendered page body via a Range set on the
 * exact text-node offsets. A triple-click paragraph-select was tried
 * first and rejected: `Selection.toString()` for a triple-click-selected
 * `<p>` includes a trailing "\n" past the sentence's own text (a Chromium
 * paragraph-select artifact), which corrupts the stored quote and makes
 * every later re-match fail. A script-driven `Selection.addRange()` still
 * fires the native `selectionchange` event `useTextSelection`
 * (SelectionCapture's hook) listens for — it's a real Selection-object
 * mutation, just not a mouse gesture — so this is a faithful trigger, not
 * a bypass of the component under test.
 *
 * Hoisted to module scope (rather than declared per `describe` block) so
 * both the happy-path suite and the best-effort-fallback suite below share
 * one implementation.
 */
const selectTextInPageBody = async (
  page: Page,
  text: string,
): Promise<void> => {
  await page.evaluate((needle) => {
    const container = document.querySelector('.wiki');
    if (container == null) {
      throw new Error('page body container (.wiki) not found');
    }

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node != null) {
      const index = node.textContent?.indexOf(needle) ?? -1;
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + needle.length);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        return;
      }
      node = walker.nextNode();
    }
    throw new Error(`text not found in page body: ${needle}`);
  }, text);
};

test.describe('Inline comment', () => {
  // Serial: comment creation is a real, non-idempotent backend write and later
  // tests (reload / reply) depend on the comment created by an earlier test in
  // this file, the same reasoning `20-basic-features/comments.spec.ts` uses.
  test.describe.configure({ mode: 'serial' });

  // Scoped by testInfo.retry (same technique as comments.spec.ts) so a
  // serial-group retry gets a comment-free page instead of inheriting an
  // earlier attempt's inline comments.
  const inlineCommentPagePath = (retry: number) =>
    `/inline-comment-e2e${retry}`;

  const targetSentence =
    'This sentence is the target of an inline comment for end-to-end testing.';
  const pageBody = [
    '# Inline comment E2E',
    '',
    'Some intro text before the target.',
    '',
    targetSentence,
    '',
    'Some trailing text after the target.',
    '',
  ].join('\n');

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  test('Create a page containing the target text', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: inlineCommentPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);
  });

  test('Selecting text shows the create form; submitting it adds the comment to the list', async ({
    page,
  }, testInfo) => {
    await page.goto(inlineCommentPagePath(testInfo.retry));
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);

    // `.wiki` being visible only proves the SSR'd markdown is on the page —
    // SelectionCapture mounts separately, via `next/dynamic({ ssr: false })`
    // (PageView.tsx), as its own client-only chunk. It renders an invisible
    // `inline-comment-ready` marker once it settles into its idle stage, and
    // waiting for that marker to attach is a simple, one-time readiness
    // signal that the inline-comment client bundle has mounted before the
    // one-shot `selectTextInPageBody` (a plain `page.evaluate`, not a
    // Playwright action with built-in retry) fires.
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);

    // Requirement 1.1 (inline-comment-selection-ux): a non-empty selection
    // shows only the lightweight create action first, not the form itself.
    const actionButton = page.getByTestId('selection-action-button');
    await expect(actionButton).toBeVisible();

    // Requirement 2.1: choosing the action expands it into the input form.
    await actionButton.click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();
    await expect(form.locator('.inline-comment-form-quote')).toHaveText(
      targetSentence,
    );

    const commentText = 'an origin inline comment created by the e2e test';
    // InlineCommentForm's comment input is the same CodeMirror-based editor
    // (CodeMirrorEditorComment) the page-end comment thread uses — driven
    // the same way `20-basic-features/comments.spec.ts` drives it.
    await form.locator('.cm-content').fill(commentText);

    // Requirement 1.2: submitting saves the comment (quote/prefix/suffix/offset).
    await form.getByTestId('inline-comment-submit-button').click();

    // The form closes on a successful submit (SelectionCapture.closeForm).
    await expect(form).not.toBeVisible();

    // Requirement 2.5/2.6: the comment appears in the page's inline-comment list.
    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();
    await expect(item).toContainText(commentText);
  });

  test('After reloading the page, the comment persists and its highlight is restored', async ({
    page,
  }, testInfo) => {
    await page.goto(inlineCommentPagePath(testInfo.retry));

    // The comment created in the previous test is still there after a fresh
    // page load (list persistence, requirement 2.5).
    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();
    await expect(item).toContainText(
      'an origin inline comment created by the e2e test',
    );

    // Requirement 2.1/2.2: on reload, the anchor is re-resolved from the
    // saved quote/prefix/suffix against the freshly-rendered body, and a
    // highlight is drawn for the exact-match range. InlineCommentHighlight
    // registers resolved ranges under CSS.highlights (the CSS Custom
    // Highlight API) rather than mutating the DOM (see that component's own
    // doc comment for why), so the registered highlight itself — not a
    // `<mark>` element — is the only DOM-observable signal that re-anchoring
    // actually succeeded. Poll because the highlight is drawn only after
    // AnchorResolver's container-settle detection fires.
    await expect
      .poll(async () =>
        page.evaluate(
          () => CSS.highlights.get('growi-inline-comment')?.size ?? 0,
        ),
      )
      .toBeGreaterThan(0);
  });

  test('Replying to the inline comment nests the reply under the origin comment in the list', async ({
    page,
  }, testInfo) => {
    await page.goto(inlineCommentPagePath(testInfo.retry));

    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();

    const replyText = 'a reply to the origin inline comment';
    // Since task 5.2, the reply input is not a plain always-visible
    // `<textarea>`/"Reply" button pair -- it's a "Reply..." toggle that must
    // be clicked first to reveal `MentionAwareCommentInput`'s own CodeMirror
    // editor and submit button (design.md 決定5). Reuses the same
    // `.cm-content` fill + `inline-comment-submit-button` testid interaction
    // pattern the mention-picker and multi-line-submission tests above
    // already establish for that shared editor, scoped to this `item` since
    // `inline-comment-submit-button` is also used by the (currently closed)
    // origin-comment form elsewhere on the page.
    await item.getByTestId('inline-comment-reply-toggle-button').click();
    await item.locator('.cm-content').fill(replyText);
    await item.getByTestId('inline-comment-submit-button').click();

    // Requirement 1.8/2.5: the reply (no anchor of its own) is nested under
    // its origin comment's own list item, not appended as a sibling.
    const reply = item.getByTestId('inline-comment-reply');
    await expect(reply).toBeVisible();
    await expect(reply).toContainText(replyText);
  });
});

test.describe('Inline comment - mention picker and multi-line submission', () => {
  // Serial: the mention-picker and multi-line-submission tests both open a
  // fresh form via a fresh page.goto, so they do not depend on each other's
  // form state -- but they share one created page, the same reasoning the
  // other suites in this file use for the page-creation test.
  test.describe.configure({ mode: 'serial' });

  const mentionPagePath = (retry: number) =>
    `/inline-comment-e2e-mention${retry}`;

  const targetSentence =
    'This sentence anchors the mention-picker end-to-end test.';
  const pageBody = [
    '# Inline comment E2E - mention picker',
    '',
    targetSentence,
    '',
  ].join('\n');

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  test('Create a page containing the target sentence', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: mentionPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);
  });

  test('Choosing a candidate from the mention picker inserts "@<username> " at the cursor position, not merely appended', async ({
    page,
  }, testInfo) => {
    await page.goto(mentionPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();

    const commentEditor = form.locator('.cm-content');

    // Requirement 3.3 says the picked mention is inserted into the comment
    // body -- but "inserted" and "appended" would look identical if the
    // cursor always happens to sit at the end of an empty editor. To prove
    // this is a genuine at-cursor insertion (InlineCommentForm's
    // `insertMention` calling `codeMirrorEditor.insertText`, not a
    // textarea-level append), type text around the cursor first, then move
    // the cursor to the middle before opening the picker: "AZ" -> ArrowLeft
    // -> cursor sits between "A" and "Z".
    await commentEditor.click();
    await commentEditor.pressSequentially('AZ');
    await page.keyboard.press('ArrowLeft');

    // Requirement 3.1: the mention picker is a separate operation from the
    // body input itself.
    const mentionButton = form.getByTestId('mention-picker-button');
    await mentionButton.click();

    // Requirement 3.2: choosing the operation shows a list of mentionable
    // users. The logged-in admin user (playwright/utils/login.ts) is always
    // a real, mentionable user, so this list is never empty in this
    // environment.
    // Scoped to the mention picker's own dropdown menu (its sibling in the
    // DOM), not just `.dropdown-item` anywhere in the form -- the comment
    // editor's own toolbar renders several other, normally-hidden
    // dropdown-item lists (table/drawio template menus) that a looser
    // selector would match instead.
    const mentionMenu = mentionButton.locator(
      'xpath=following-sibling::div[contains(concat(" ", normalize-space(@class), " "), " dropdown-menu ")]',
    );
    const firstCandidate = mentionMenu.locator('.dropdown-item').first();
    await expect(firstCandidate).toBeVisible();
    const candidateUsername = await firstCandidate
      .locator('span')
      .first()
      .innerText();

    // Requirement 3.3: selecting the candidate inserts its mention into the
    // comment body, at the cursor position recorded above -- landing between
    // "A" and "Z", not after them.
    await firstCandidate.click();
    await expect(commentEditor).toHaveText(`A@${candidateUsername} Z`);
  });

  test('Submitting a multi-line comment body closes the form and the comment appears in the bottom list as an inline comment', async ({
    page,
  }, testInfo) => {
    await page.goto(mentionPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();

    const firstLine = 'a multi-line inline comment created by the e2e test';
    const secondLine = 'its second line, typed via a real Enter keypress';
    const commentEditor = form.locator('.cm-content');
    // `.fill()` (used by the single-line scenarios elsewhere in this file)
    // sets the whole editor value in one shot; typing the Enter keypress
    // explicitly here is what actually exercises a multi-line body, the same
    // technique `presentation.spec.ts` and `emacs-keymap.spec.ts` use for a
    // multi-line `.cm-content` fill.
    await commentEditor.fill(firstLine);
    await commentEditor.press('End');
    await commentEditor.press('Enter');
    await commentEditor.pressSequentially(secondLine);
    await expect(commentEditor).toContainText(firstLine);
    await expect(commentEditor).toContainText(secondLine);

    // Requirement 2.4: submitting closes the input form.
    await form.getByTestId('inline-comment-submit-button').click();
    await expect(form).not.toBeVisible();

    // Requirement 3.1/2.5 continuity with the base `inline-comment` E2E: the
    // comment shows up in the page's bottom inline-comment list, in the same
    // "inline-comment-item contains the comment text" display format already
    // established above (`inline-comment-item` -> `toContainText`).
    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();
    await expect(item).toContainText(firstLine);
    await expect(item).toContainText(secondLine);
  });
});

test.describe('Inline comment - action button lifecycle before the form opens', () => {
  // Serial: the second test depends on the page created by the first, the
  // same reasoning the other suites in this file use.
  test.describe.configure({ mode: 'serial' });

  const actionButtonPagePath = (retry: number) =>
    `/inline-comment-e2e-action-button${retry}`;

  const firstSentence =
    'First target sentence for action button positioning tests.';
  const secondSentence =
    'Second target sentence for action button positioning tests, far below the first.';

  // Enough filler paragraphs to put a large, reliable vertical gap between
  // `firstSentence` and `secondSentence`, so a passing "the button moved"
  // assertion below cannot be a false positive from sub-pixel layout noise.
  const fillerParagraphs = Array.from(
    { length: 20 },
    (_, i) =>
      `Filler paragraph ${i} pushes the second target sentence well below the first one.`,
  );
  const pageBody = [
    '# Inline comment E2E - action button lifecycle',
    '',
    firstSentence,
    '',
    ...fillerParagraphs.flatMap((paragraph) => [paragraph, '']),
    secondSentence,
    '',
  ].join('\n');

  /**
   * The bounding rect of the (single) current DOM Range, via the same
   * `getBoundingClientRect()` mechanism Playwright's `Locator.boundingBox()`
   * uses under the hood — confirmed empirically (a fixture with a scrolled
   * page: both report identical, scroll-adjusted, viewport-relative
   * coordinates) so the two are safe to diff directly below. Used to assert
   * the action button is actually positioned near the selection
   * (Requirement 1.1) rather than merely visible somewhere.
   */
  const getSelectionRect = (
    targetPage: Page,
  ): Promise<{ top: number; bottom: number } | null> => {
    return targetPage.evaluate(() => {
      const selection = window.getSelection();
      if (selection == null || selection.rangeCount === 0) {
        return null;
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    });
  };

  const clearSelectionInPageBody = async (targetPage: Page): Promise<void> => {
    await targetPage.evaluate(() => {
      window.getSelection()?.removeAllRanges();
    });
  };

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  test('Create a page containing two widely-separated target sentences', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: actionButtonPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(firstSentence);
    await expect(page.locator('.wiki').first()).toContainText(secondSentence);
  });

  test('The action button appears near a selection, tracks a changed selection, and disappears once the selection is cleared', async ({
    page,
  }, testInfo) => {
    await page.goto(actionButtonPagePath(testInfo.retry));
    await expect(page.locator('.wiki').first()).toContainText(firstSentence);
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    const actionButton = page.getByTestId('selection-action-button');

    // Requirement 1.2 (contrast case for the button appearing at all): no
    // selection yet, so no action button.
    await expect(actionButton).not.toBeVisible();

    // Requirement 1.1: selecting non-empty text shows the action button near
    // the selection — assert this quantitatively (the button's vertical
    // position is close to the selection's own rect), not merely "visible".
    await selectTextInPageBody(page, firstSentence);
    await expect(actionButton).toBeVisible();

    const firstButtonBox = await actionButton.boundingBox();
    const firstSelectionRect = await getSelectionRect(page);
    if (firstButtonBox == null || firstSelectionRect == null) {
      throw new Error('expected both a button box and a selection rect');
    }
    // The popover sits directly above/below the selection (SelectionPopover's
    // Popper placement) — well within a generous 200px tolerance, whereas the
    // page has ~20 filler paragraphs of vertical room it would land in if
    // positioning were broken (e.g. pinned to the viewport origin).
    expect(Math.abs(firstButtonBox.y - firstSelectionRect.top)).toBeLessThan(
      200,
    );

    // Requirement 1.3: changing the selection (without ever clicking the
    // button) moves the action button to track the new selection. Poll
    // because the reposition happens asynchronously (selectionchange →
    // recapture → Popper recompute), not synchronously with the selection
    // change itself.
    await selectTextInPageBody(page, secondSentence);
    await expect
      .poll(async () => {
        const box = await actionButton.boundingBox();
        return box == null ? null : box.y - firstButtonBox.y;
      })
      .toBeGreaterThan(200);

    const secondButtonBox = await actionButton.boundingBox();
    const secondSelectionRect = await getSelectionRect(page);
    if (secondButtonBox == null || secondSelectionRect == null) {
      throw new Error('expected both a button box and a selection rect');
    }
    expect(Math.abs(secondButtonBox.y - secondSelectionRect.top)).toBeLessThan(
      200,
    );

    // Requirement 1.4: clearing the selection before the button is chosen
    // makes it disappear.
    await clearSelectionInPageBody(page);
    await expect(actionButton).not.toBeVisible();
  });
});

test.describe('Inline comment - best-effort fallback after the anchored text is edited away', () => {
  // Serial for the same reason as the suite above: the second test depends
  // on the comment created by the first, real backend state.
  test.describe.configure({ mode: 'serial' });

  const fallbackPagePath = (retry: number) =>
    `/inline-comment-e2e-fallback${retry}`;

  // Long enough that even the fuzzy matcher's tolerance
  // (`FUZZY_MATCH_ERROR_RATE = 0.2`, capped at `FUZZY_MATCH_MAX_ERRORS = 20`
  // — see quote-matcher.ts) cannot bridge the gap to its replacement below.
  const targetSentence =
    'This sentence will be entirely removed from the page body after the comment is created, breaking its anchor on purpose.';
  const pageBody = [
    '# Inline comment E2E - fallback',
    '',
    'Some intro text before the target.',
    '',
    targetSentence,
    '',
    'Some trailing text after the target.',
    '',
  ].join('\n');

  // A short, wholly unrelated replacement for `targetSentence`. Levenshtein
  // distance is always at least the length difference between the two
  // strings, so `targetSentence.length - replacementSentence.length` alone
  // (119 - 10 = 109) already exceeds `matchQuote`'s worst-case tolerance of
  // `min(ceil(119 * 0.2), 20) = 20` errors — independent of how much (or
  // little) the wording happens to overlap. This makes the "quote is
  // unrecoverable" outcome deterministic rather than a near-miss that could
  // flip to a fuzzy match under an unlucky character overlap.
  const replacementSentence = 'Unrelated.';

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  test('Create a page, then create an inline comment on a sentence', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: fallbackPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);

    // Requirement 2.1: the create action must be chosen before the form opens.
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();

    await form
      .locator('.cm-content')
      .fill('a comment whose anchor will be lost');
    await form.getByTestId('inline-comment-submit-button').click();
    await expect(form).not.toBeVisible();

    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();

    // Requirement 2.1/2.2: sanity-check the highlight is actually drawn
    // before the edit — otherwise a "no highlight after edit" assertion
    // later would be true for the wrong reason (it was never drawn at all).
    await expect
      .poll(async () =>
        page.evaluate(
          () => CSS.highlights.get('growi-inline-comment')?.size ?? 0,
        ),
      )
      .toBeGreaterThan(0);
  });

  test('After the commented-on text is completely edited away and the page reloads, the highlight disappears but the comment remains listed', async ({
    page,
    request,
  }) => {
    if (createdPage == null) {
      throw new Error('createdPage was not set by the previous test');
    }

    // Requirement 5.1/5.3: replace the whole paragraph that contained the
    // quoted sentence with unrelated text — not merely shifted or
    // reworded, but gone — so neither exact nor fuzzy matching in
    // `matchQuote` can locate it in the freshly-rendered body.
    const editedBody = pageBody.replace(targetSentence, replacementSentence);
    createdPage = await updatePage(request, createdPage, editedBody);

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(
      replacementSentence,
    );
    await expect(page.locator('.wiki').first()).not.toContainText(
      targetSentence,
    );

    // Requirement 2.5: the comment is still in the list (not deleted, not
    // hidden) even though its anchor could no longer be resolved.
    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();
    await expect(item).toContainText('a comment whose anchor will be lost');

    // Requirement 2.4/5.3: no highlight is drawn for the now-unresolvable
    // anchor. `item` being visible already proves the inline-comment data
    // (the same fetch `useAnchorResolver` reads its anchors from) has
    // loaded, so by this point AnchorResolver's anchors-content-change
    // effect (`use-anchor-resolver.ts`) has already run at least once against
    // the freshly-rendered body — there is no later trigger that could still
    // produce a highlight. The extra wait below only guards against a
    // (self-healing) re-anchor via a second `useContainerSettle` tick
    // within its `WATCH_TIMEOUT_MS` window flipping this from 0 to
    // non-zero after the first check.
    const highlightCount = () =>
      page.evaluate(
        () => CSS.highlights.get('growi-inline-comment')?.size ?? 0,
      );
    expect(await highlightCount()).toBe(0);
    await page.waitForTimeout(1000);
    expect(await highlightCount()).toBe(0);
  });
});

test.describe('Inline comment - visual consistency of the creation UI', () => {
  // Serial: every test in this suite reuses the one page created by the
  // first test, the same reasoning the other suites in this file use.
  test.describe.configure({ mode: 'serial' });

  const visualConsistencyPagePath = (retry: number) =>
    `/inline-comment-e2e-visual-consistency${retry}`;

  const targetSentence =
    'This sentence anchors the visual-consistency end-to-end test.';
  const pageBody = [
    '# Inline comment E2E - visual consistency',
    '',
    targetSentence,
    '',
  ].join('\n');

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  /**
   * `next-themes` only writes the `data-bs-theme` attribute in reaction to a
   * user-triggered theme change; nothing was observed to overwrite it once
   * set directly (verified by reading the attribute right back after each
   * call below across all three tests in this suite). Writing it directly
   * on `<html>` is therefore a faithful stand-in for a real theme switch:
   * it is the exact attribute/selector Bootstrap's `color-mode` mixin reads
   * (`[data-bs-theme="dark"] { ... }`, `bootstrap/scss/mixins/_color-mode.scss`).
   * Design.md's Testing Strategy ("テーマ追随") calls out this same technique
   * for exercising Req 11.3/11.4 without going through the admin
   * theme-customize screen.
   */
  const setBsTheme = async (
    targetPage: Page,
    theme: 'light' | 'dark',
  ): Promise<void> => {
    await targetPage.evaluate((t) => {
      document.documentElement.setAttribute('data-bs-theme', t);
    }, theme);
  };

  /**
   * Bootstrap's base `.btn` rule (and other themed elements exercised here)
   * transitions `background-color`/`border-color`/`color` over ~150ms
   * (`bootstrap/scss/_variables.scss`'s `$btn-transition`): the CSS custom
   * property driving the color (e.g. `--bs-btn-bg`) updates the instant
   * `data-bs-theme` changes, but the *painted* value animates toward it, so
   * a `getComputedStyle` read taken right after `setBsTheme` was observed
   * (empirically, including via Chrome DevTools Protocol's
   * `CSS.getComputedStyleForNode`) to still be mid-transition rather than
   * the settled target color.
   *
   * Bootstrap's own transition mixin already turns transitions off under
   * `prefers-reduced-motion: reduce`, and that would normally be the
   * cleaner opt-out (`test.use({ reducedMotion: 'reduce' })`) — but that
   * was tried first and, in this environment, left
   * `window.matchMedia('(prefers-reduced-motion: reduce)').matches` false
   * (verified empirically; `test.use({ colorScheme: 'dark' })` in the same
   * spot correctly flips `prefers-color-scheme`, so this is specific to the
   * `reducedMotion` context option here, not `test.use` in general).
   * Injecting a `!important` stylesheet after each navigation is a
   * deterministic substitute that does not depend on that context option
   * behaving as documented.
   */
  const disableCssTransitions = async (targetPage: Page): Promise<void> => {
    await targetPage.addStyleTag({
      content:
        '*, *::before, *::after { transition: none !important; animation: none !important; }',
    });
  };

  type ThemedColors = {
    backgroundColor: string;
    borderColor: string;
    color: string;
  };

  const readThemedColors = (
    locator: ReturnType<Page['locator']>,
  ): Promise<ThemedColors> =>
    locator.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.color,
      };
    });

  test('Create a page containing the target sentence', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: visualConsistencyPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);
  });

  test('Switching data-bs-theme changes the action button colors, and switching back restores them (Req 11.3, 11.4)', async ({
    page,
  }, testInfo) => {
    await page.goto(visualConsistencyPagePath(testInfo.retry));
    await disableCssTransitions(page);
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);
    const actionButton = page.getByTestId('selection-action-button');
    await expect(actionButton).toBeVisible();

    await setBsTheme(page, 'light');
    const lightColors = await readThemedColors(actionButton);

    // Requirement 11.3/11.4: switching the theme (light -> dark here, the
    // direction Req 11.4 names explicitly) changes background/border/text
    // color, because SelectionActionButton.module.scss maps its Bootstrap
    // button variables onto --bs-body-bg / --bs-border-color / --bs-body-color,
    // which the dark [data-bs-theme="dark"] rule set redefines.
    await setBsTheme(page, 'dark');
    const darkColors = await readThemedColors(actionButton);
    expect(darkColors.backgroundColor).not.toBe(lightColors.backgroundColor);
    expect(darkColors.borderColor).not.toBe(lightColors.borderColor);
    expect(darkColors.color).not.toBe(lightColors.color);

    // Non-vacuousness / round-trip check: switching back to light restores
    // the exact colors captured the first time. This rules out the earlier
    // "changed" assertion being a false positive from unrelated timing/CSS
    // recalculation noise rather than a genuine theme-attribute dependency
    // (e.g. it would fail this round-trip if the color depended on paint
    // order or some one-shot transition instead of the live attribute).
    await setBsTheme(page, 'light');
    const lightColorsAgain = await readThemedColors(actionButton);
    expect(lightColorsAgain).toEqual(lightColors);
  });

  test('Switching data-bs-theme changes the input form colors, and switching back restores them (Req 11.3, 11.4)', async ({
    page,
  }, testInfo) => {
    await page.goto(visualConsistencyPagePath(testInfo.retry));
    await disableCssTransitions(page);
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();

    await setBsTheme(page, 'light');
    const lightColors = await readThemedColors(form);

    // Requirement 11.3/11.4: the form's `bg-body border` classes
    // (InlineCommentForm.tsx) read --bs-body-bg / --bs-border-color, and the
    // form has no explicit text-color class so it inherits --bs-body-color —
    // all three change value under [data-bs-theme="dark"].
    await setBsTheme(page, 'dark');
    const darkColors = await readThemedColors(form);
    expect(darkColors.backgroundColor).not.toBe(lightColors.backgroundColor);
    expect(darkColors.borderColor).not.toBe(lightColors.borderColor);
    expect(darkColors.color).not.toBe(lightColors.color);

    // Round-trip, same reasoning as the action-button test above.
    await setBsTheme(page, 'light');
    const lightColorsAgain = await readThemedColors(form);
    expect(lightColorsAgain).toEqual(lightColors);
  });

  test('The input form hides the CodeMirror toolbar and the line-number/fold gutters (design.md decision 5)', async ({
    page,
  }, testInfo) => {
    await page.goto(visualConsistencyPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();
    // Wait for the CodeMirror editor itself to be mounted before asserting
    // on the absence of its sub-parts, so a "0 matches" result reliably
    // means "hidden by hideToolbar/basicSetup", not "editor not mounted yet".
    await expect(form.locator('.cm-content')).toBeVisible();

    // `hideToolbar` (InlineCommentForm.tsx passing it to
    // CodeMirrorEditorComment, packages/editor's CodeMirrorEditor.tsx:248)
    // must suppress the whole Toolbar, including the template button — a
    // control that renders unconditionally whenever the toolbar exists
    // (TemplateButton.tsx has no feature gate), so its absence is a direct
    // proxy for "the toolbar is not rendered" rather than merely CSS-hidden.
    await expect(form.getByTestId('open-template-button')).toHaveCount(0);

    // `cmProps.basicSetup: { lineNumbers: false, foldGutter: false }`
    // (InlineCommentForm.tsx) must remove the gutter container entirely --
    // `.cm-gutters` is CodeMirror's own wrapper for the line-number and fold
    // gutters (@codemirror/view), and it is only emitted when at least one
    // gutter extension is active.
    await expect(form.locator('.cm-gutters')).toHaveCount(0);
  });
});

test.describe('Inline comment - highlight color stays consistent across the pending (selecting/composing) states, and switches to a distinct color once saved (Req 1.1, 1.2, 1.5, 12.4-12.7)', () => {
  // Serial: every test in this suite reuses the one page created by the
  // first test, the same reasoning the other suites in this file use.
  test.describe.configure({ mode: 'serial' });

  const highlightConsistencyPagePath = (retry: number) =>
    `/inline-comment-e2e-highlight-consistency${retry}`;

  const targetSentence =
    'This sentence anchors the highlight-color-consistency end-to-end test.';
  const pageBody = [
    '# Inline comment E2E - highlight color consistency',
    '',
    targetSentence,
    '',
  ].join('\n');

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  /**
   * Reads the *computed* `background-color` of a CSS pseudo-element
   * (`::selection` or `::highlight(<name>)`) as it applies to the element
   * that wraps `text`, via `getComputedStyle(el, pseudo)`.
   *
   * This was chosen over sampling painted pixels from a screenshot (the
   * more obvious "read the rendered color" technique) after an empirical
   * probe against this repo's own Playwright/Chromium build confirmed both
   * pseudo forms resolve through `getComputedStyle`'s second (pseudo-element)
   * argument -- Chromium computes the cascade for `::selection` and for
   * `::highlight()` independently of whether any text is presently
   * selected/registered, so this reads the *rule* that would paint, not a
   * rasterized snapshot of it. That is the more robust and maintainable
   * choice here: no PNG-decoding dependency (this repo has none -- `sharp`
   * only appears in the lockfile as an unrelated transitive dependency), no
   * pixel-coordinate math tied to font metrics/line-wrapping, and no
   * flakiness from anti-aliased edges. It is a faithful stand-in for "what
   * gets painted" specifically because each state below queries the one
   * pseudo that CSS's own highlight-painting order
   * (`::highlight() < ::selection`, see design.md decision 1) actually puts
   * on top in that state: `::selection` while a real browser selection
   * exists (selecting), `::highlight(growi-inline-comment-pending)` once
   * the browser selection is dropped but the form is still open (composing,
   * PendingSelectionHighlight), and `::highlight(growi-inline-comment)` once
   * saved (InlineCommentHighlight).
   */
  const getPseudoBackgroundColor = (
    targetPage: Page,
    text: string,
    pseudo: string,
  ): Promise<string> =>
    targetPage.evaluate(
      ({ needle, pseudoSelector }) => {
        const container = document.querySelector('.wiki');
        if (container == null) {
          throw new Error('page body container (.wiki) not found');
        }
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
        );
        let node = walker.nextNode();
        while (node != null) {
          if (node.textContent?.includes(needle)) {
            const el = node.parentElement;
            if (el == null) {
              throw new Error('matched text node has no parent element');
            }
            return window.getComputedStyle(el, pseudoSelector).backgroundColor;
          }
          node = walker.nextNode();
        }
        throw new Error(`text not found in page body: ${needle}`);
      },
      { needle: text, pseudoSelector: pseudo },
    );

  /**
   * Independently resolves `--grw-inline-comment-marker-bg` (the SAVED
   * highlight's color token) to a computed color, by applying it to a
   * throwaway element rather than hard-coding the expected color (e.g.
   * `#FFFA90`) in the test -- design.md decision 4 notes the default is a
   * deliberate, revisitable choice, so this test should keep passing if that
   * default value alone ever changes.
   */
  const readInlineCommentMarkerColor = (targetPage: Page): Promise<string> =>
    targetPage.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--grw-inline-comment-marker-bg)';
      document.body.appendChild(probe);
      const color = window.getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });

  /**
   * Independently resolves the PENDING (selecting/composing) highlight's
   * actual painted color -- `color-mix(in srgb, var(--grw-inline-comment-marker-bg-pending)
   * 70%, transparent)`, the exact expression `PendingSelectionHighlight.tsx`
   * emits -- again by applying it to a throwaway element rather than
   * hard-coding a resolved color, so this stays correct if the pending
   * token's default value changes. Kept as its own helper (distinct from
   * `readInlineCommentMarkerColor` above) because Requirement 1.1/1.2 makes
   * the pending and saved colors deliberately DIFFERENT tokens now, not two
   * readings of the same one.
   */
  const readPendingHighlightColor = (targetPage: Page): Promise<string> =>
    targetPage.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor =
        'color-mix(in srgb, var(--grw-inline-comment-marker-bg-pending) 70%, transparent)';
      document.body.appendChild(probe);
      const color = window.getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });

  test('Create a page containing the target sentence', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: highlightConsistencyPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);
  });

  test('The pending range keeps a consistent color across selecting and composing, and switches to the distinct saved color once committed', async ({
    page,
  }, testInfo) => {
    await page.goto(highlightConsistencyPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    const markerColor = await readInlineCommentMarkerColor(page);
    const pendingColor = await readPendingHighlightColor(page);
    // Sanity: neither color is the browser's fully transparent default --
    // otherwise every comparison below would pass vacuously (states all
    // painting "nothing").
    expect(markerColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(pendingColor).not.toBe('rgba(0, 0, 0, 0)');
    // Requirement 1.1/1.2 (this spec) retracts the previous
    // inline-comment-visual-consistency spec's Requirement 12.8, which
    // required the saved and pending colors to be identical: the pending
    // (selecting/composing) color must now be genuinely distinguishable
    // from the saved color, not merely a differently-computed reading of
    // the same one, so an overlapping selection over an already-saved
    // comment can show both at once (see the "stays distinguishable" suite
    // further down this file).
    expect(pendingColor).not.toBe(markerColor);

    // --- State 1: selecting (Req 12.4) ---
    // Requirement 12.4: a plain text selection, before the create action is
    // even chosen, is painted the pending color -- CSS's own painting order
    // (`::highlight() < ::selection`) puts `::selection` on top here, so
    // this is the pseudo that actually determines what's painted.
    await selectTextInPageBody(page, targetSentence);
    await expect(page.getByTestId('selection-action-button')).toBeVisible();
    const selectingColor = await getPseudoBackgroundColor(
      page,
      targetSentence,
      '::selection',
    );
    expect(selectingColor).toBe(pendingColor);

    // --- State 2: composing (Req 12.5, 12.6) ---
    // Choosing the create action opens the form; clicking into its editor
    // moves focus into the input, which drops the browser's native
    // selection -- the same "input欄にカーソルを移してブラウザ上の選択が解除
    // された" state Req 12.6 names. Confirmed below via `window.getSelection()`
    // before reading the composing-state color, so a false pass can't be
    // hiding behind a selection that never actually cleared.
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();
    await form.locator('.cm-content').click();
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');

    // Confirm the pending highlight is actually registered under
    // CSS.highlights before reading its color -- otherwise this assertion
    // could pass vacuously if PendingSelectionHighlight's registration
    // effect were removed while its <style jsx global> rule stayed behind,
    // since that rule is emitted unconditionally. Mirrors the equivalent
    // wait used for the saved-comment state below.
    await expect
      .poll(() =>
        page.evaluate(
          () => CSS.highlights.get('growi-inline-comment-pending')?.size ?? 0,
        ),
      )
      .toBeGreaterThan(0);

    const composingColor = await getPseudoBackgroundColor(
      page,
      targetSentence,
      '::highlight(growi-inline-comment-pending)',
    );
    expect(composingColor).toBe(pendingColor);
    // Decisive assertion for the pending half of Requirement 1.5: selecting
    // and composing are both painted from the same pending token, so they
    // must still match EACH OTHER, even though the saved state below no
    // longer matches them.
    expect(selectingColor).toBe(composingColor);

    // --- State 3: saved (Req 1.1, 1.2) ---
    const commentText = 'a comment used to check the saved highlight color';
    await form.locator('.cm-content').fill(commentText);
    await form.getByTestId('inline-comment-submit-button').click();
    await expect(form).not.toBeVisible();

    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();
    await expect(item).toContainText(commentText);

    // The saved highlight is drawn asynchronously, once AnchorResolver
    // re-resolves the just-created anchor against the rendered body (same
    // poll pattern as the reload test above).
    await expect
      .poll(async () =>
        page.evaluate(
          () => CSS.highlights.get('growi-inline-comment')?.size ?? 0,
        ),
      )
      .toBeGreaterThan(0);

    const savedColor = await getPseudoBackgroundColor(
      page,
      targetSentence,
      '::highlight(growi-inline-comment)',
    );
    expect(savedColor).toBe(markerColor);

    // Decisive assertion (Req 1.1, 1.2): the saved color is genuinely
    // different from the pending color the range was painted with while
    // selecting/composing -- not merely each independently matching its own
    // token, but the two tokens resolving to two distinguishable colors.
    // (The OLD inline-comment-visual-consistency spec's Requirement 12.8
    // required all three states to share one identical color; this spec
    // retracts 12.8 specifically, while Requirement 1.5 keeps 12.4-12.7 --
    // theme-following, single-source-of-truth token, surviving focus moving
    // into the input -- intact, which is why those per-state assertions
    // above are unchanged.)
    expect(savedColor).not.toBe(composingColor);
  });
});

test.describe('Inline comment - highlight correctness on a page with an async lsx widget', () => {
  // Serial for the same reason as the suites above: the second test depends
  // on the comment created by the first, real backend state.
  test.describe.configure({ mode: 'serial' });

  const lsxPagePath = (retry: number) => `/inline-comment-e2e-lsx${retry}`;

  // `$lsx(depth=1)` is remark-lsx's directive syntax (see
  // packages/remark-lsx/src/client/services/renderer/lsx.ts) — a bare `$lsx(...)`
  // on its own line, with no explicit path attribute, lists the current page's
  // own children (packages/preset-templates' "displaying-child-pages" template
  // uses the identical form).
  //
  // The anchored quote is the child page's own basename — text that does not
  // exist ANYWHERE in the DOM until lsx's async fetch (useSWRxLsx, an
  // unconditional axios GET to /_api/lsx) resolves and `LsxListView` replaces
  // the loading placeholder with the real child list (`LsxPage.tsx` renders
  // the basename as the link's visible text). This is deliberately different
  // from anchoring on a static sentence sitting in its own paragraph: a quote
  // in a paragraph lsx never touches would still resolve correctly even if
  // settle detection were completely broken, because `resolveDomPosition`
  // recomputes the Range fresh against whatever DOM exists at match time — a
  // wrong-but-still-findable match isn't distinguishable from a correct one.
  // By contrast, quoting text that plainly does not exist pre-settle means
  // `matchQuote` must return `not_found` before lsx resolves and can only
  // succeed afterward — so this highlight can only ever come from a
  // recompute that happens at or after the real settle point (design.md's
  // `use-container-settle`), not from the settle-independent
  // anchors-content-change trigger racing ahead of it.
  const childBasename = 'AsyncLsxResolvedChildMarker';
  const pageBody = [
    '# Inline comment E2E - async lsx widget',
    '',
    'Some intro text before the lsx block.',
    '',
    '$lsx(depth=1)',
    '',
  ].join('\n');

  let createdPage: CreatedPage | undefined;
  let createdChildPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    const pages = [createdPage, createdChildPage].filter(
      (p): p is CreatedPage => p != null,
    );
    if (pages.length > 0) {
      await deletePagesCompletely(request, pages);
    }
  });

  test('Create a page with a real lsx block, then comment on the child page name it renders', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: lsxPagePath(testInfo.retry),
      body: pageBody,
    });
    // The child page's basename IS the quoted text — it only appears in the
    // DOM once lsx's async fetch resolves and renders this child's link.
    createdChildPage = await createPage(request, {
      path: `${createdPage.path}/${childBasename}`,
      body: 'A child page whose basename is the inline comment anchor.',
    });

    await page.goto(createdPage.path);

    // Sanity: lsx actually rendered its child (not an error state) — otherwise
    // the "async round-trip with real content" premise of this test wouldn't
    // hold. LsxPage links render the child page's basename as their label
    // rather than its path (the href is the page's ObjectId), so match by
    // visible link text.
    await expect(
      page.locator('.wiki .lsx').getByRole('link', { name: childBasename }),
    ).toBeVisible();

    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, childBasename);

    // Requirement 2.1: the create action must be chosen before the form opens.
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();
    await expect(form.locator('.inline-comment-form-quote')).toHaveText(
      childBasename,
    );

    await form
      .locator('.cm-content')
      .fill('a comment anchored on the lsx-rendered child page name');
    await form.getByTestId('inline-comment-submit-button').click();
    await expect(form).not.toBeVisible();

    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();
  });

  test('After reloading with the lsx fetch artificially delayed, the highlight lands at the correct position only once lsx settles', async ({
    page,
  }, testInfo) => {
    if (createdPage == null) {
      throw new Error('createdPage was not set by the previous test');
    }

    // Delay `/_api/lsx` deterministically instead of relying on the fetch
    // happening to still be in flight when we check — a race would make this
    // test flaky in either direction (assert too early and it's a false
    // negative on a fast CI run; assert too late and it never observes the
    // pending state at all).
    const LSX_FETCH_DELAY_MS = 1500;
    await page.route('**/_api/lsx**', async (route) => {
      await new Promise((resolve) => {
        setTimeout(resolve, LSX_FETCH_DELAY_MS);
      });
      await route.continue();
    });

    await page.goto(lsxPagePath(testInfo.retry));

    const lsxContainer = page.locator('.wiki .lsx').first();
    await expect(lsxContainer).toBeAttached();

    // Confirm the delay is genuinely observed by the app: right after load,
    // lsx is still mid-fetch (the rendering-status attribute this feature's
    // settle detection watches — see `GROWI_IS_CONTENT_RENDERING_ATTR` in
    // design.md — is still "true").
    await expect(lsxContainer).toHaveAttribute(
      'data-growi-is-content-rendering',
      'true',
    );

    // Once the delayed fetch resolves, lsx flips the attribute to "false" —
    // the signal use-container-settle waits for before AnchorResolver
    // recomputes against the now-final DOM (Requirements 2.1/5.1).
    await expect(lsxContainer).toHaveAttribute(
      'data-growi-is-content-rendering',
      'false',
      { timeout: LSX_FETCH_DELAY_MS + 5_000 },
    );

    await expect
      .poll(async () =>
        page.evaluate(
          () => CSS.highlights.get('growi-inline-comment')?.size ?? 0,
        ),
      )
      .toBeGreaterThan(0);

    // The decisive assertion: the highlighted range's text is exactly the
    // child page's basename — text that, per the fixture design above, did
    // not exist anywhere in the DOM until lsx settled. A highlight with this
    // exact text can only have been computed after lsx's real settle point,
    // not from the settle-independent anchors-content-change trigger (which
    // would have found `not_found` had it run against the pre-settle DOM).
    const highlightedText = await page.evaluate(() => {
      const set = CSS.highlights.get('growi-inline-comment');
      const range = set != null ? [...set][0] : undefined;
      return range?.toString();
    });
    expect(highlightedText).toBe(childBasename);
  });
});

test.describe('Inline comment - shares one list and one box style with normal comments (Req 13.1-13.4, 13.9)', () => {
  // Serial: each test below posts one more comment on top of what the
  // previous test posted, and the final test reads the accumulated state --
  // the same reasoning the other suites in this file use for serial mode.
  test.describe.configure({ mode: 'serial' });

  const mixedListPagePath = (retry: number) =>
    `/inline-comment-e2e-mixed-list${retry}`;

  const targetSentence =
    'This sentence anchors the mixed-comment-list end-to-end test.';
  const pageBody = [
    '# Inline comment E2E - mixed comment list',
    '',
    targetSentence,
    '',
  ].join('\n');

  // Ordering matters here: "before" posted first, the inline comment second,
  // "after" third. Requirement 13.1/13.2 asks for the merged list to be
  // ordered by posting date, not grouped by kind -- a broken merge that
  // appended one kind after the other would put the inline comment first or
  // last instead of in the middle, so these three texts (and their expected
  // middle position for the inline one) are the decisive fixture.
  const normalCommentBeforeText =
    'a normal comment posted before the inline one';
  const inlineCommentText =
    'an inline comment posted between two normal comments';
  const normalCommentAfterText = 'a normal comment posted after the inline one';

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  test('Create a page containing the target sentence', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: mixedListPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);
  });

  test('Post a normal (page-bottom) comment first', async ({
    page,
  }, testInfo) => {
    await page.goto(mixedListPagePath(testInfo.retry));

    // Same page-bottom comment flow as `20-basic-features/comments.spec.ts`.
    await page.getByTestId('page-comment-button').click();
    await page.getByTestId('open-comment-editor-button').click();
    await page.locator('.cm-content').fill(normalCommentBeforeText);
    await page.getByTestId('comment-submit-button').first().click();

    await expect(page.locator('.page-comment-body')).toContainText(
      normalCommentBeforeText,
    );
  });

  test('Post an inline comment second', async ({ page }, testInfo) => {
    await page.goto(mixedListPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();

    await form.locator('.cm-content').fill(inlineCommentText);
    await form.getByTestId('inline-comment-submit-button').click();
    await expect(form).not.toBeVisible();

    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();
    await expect(item).toContainText(inlineCommentText);
  });

  test('Post a second normal comment third', async ({ page }, testInfo) => {
    await page.goto(mixedListPagePath(testInfo.retry));

    await page.getByTestId('page-comment-button').click();
    await page.getByTestId('open-comment-editor-button').click();
    await page.locator('.cm-content').fill(normalCommentAfterText);
    await page.getByTestId('comment-submit-button').first().click();

    await expect(page.locator('.page-comment-body').last()).toContainText(
      normalCommentAfterText,
    );
  });

  test('The three comments sit in one list, ordered by posting date, and the normal/inline items share the exact same box styling', async ({
    page,
  }, testInfo) => {
    await page.goto(mixedListPagePath(testInfo.retry));

    // Requirement 13.1: one list -- the single container `PageComment.tsx`
    // renders both kinds into (design.md 決定3). Scoped via the `.page-comments`
    // wrapper class, not `#page-comments-list` alone: `Comments.tsx`'s own
    // outer wrapper (a pre-existing, out-of-boundary issue unrelated to this
    // task) reuses the exact same id on a different element, so an id-only
    // locator would silently match both elements' children combined.
    const listItems = page.locator(
      '.page-comments > #page-comments-list > div',
    );
    await expect(listItems).toHaveCount(3);

    // Requirement 13.2: ordered by posting date, not by kind. If the merge
    // were grouped by type instead of interleaved (e.g. the pre-amend
    // `[...comments].reverse()` that never merged inline comments in at
    // all, or a broken merge that appended one kind after the other), the
    // inline comment would not land in the middle position.
    await expect(listItems.nth(0)).toContainText(normalCommentBeforeText);
    await expect(listItems.nth(1)).toContainText(inlineCommentText);
    await expect(listItems.nth(2)).toContainText(normalCommentAfterText);

    // Confirm the middle item is genuinely the inline one (not merely a
    // normal comment whose text happens to overlap), and that the other two
    // are not.
    await expect(
      listItems.nth(1).getByTestId('inline-comment-item'),
    ).toBeVisible();
    await expect(
      listItems.nth(0).getByTestId('inline-comment-item'),
    ).toHaveCount(0);
    await expect(
      listItems.nth(2).getByTestId('inline-comment-item'),
    ).toHaveCount(0);

    // Requirement 13.3/13.4: both kinds render through the shared
    // `CommentCard` (design.md 決定2), so the box each one paints --
    // `.page-comment-main.bg-comment.rounded` -- must resolve to the exact
    // same computed style, not merely a similar-looking one.
    const readBoxStyle = (locator: ReturnType<Page['locator']>) =>
      locator.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          borderStyle: style.borderStyle,
          borderWidth: style.borderWidth,
          borderRadius: style.borderRadius,
        };
      });

    const normalBox = listItems
      .nth(0)
      .locator('.page-comment-main.bg-comment.rounded');
    const inlineBox = listItems
      .nth(1)
      .locator('.page-comment-main.bg-comment.rounded');

    const normalBoxStyle = await readBoxStyle(normalBox);
    const inlineBoxStyle = await readBoxStyle(inlineBox);
    expect(inlineBoxStyle).toEqual(normalBoxStyle);

    // Sanity: the box actually paints something distinguishable, ruling out
    // the comparison above passing vacuously because neither side has any
    // rounding/background at all.
    expect(normalBoxStyle.borderRadius).not.toBe('0px');
  });
});

test.describe('Inline comment - a new selection overlapping a saved comment stays distinguishable (Req 1.1, 1.2)', () => {
  // Serial: the second test depends on the saved comment created by the
  // first, real backend state -- the same reasoning the other suites in this
  // file use.
  test.describe.configure({ mode: 'serial' });

  const overlapPagePath = (retry: number) =>
    `/inline-comment-e2e-overlap${retry}`;

  const targetSentence =
    'This sentence anchors the overlapping-highlight end-to-end test.';
  const pageBody = [
    '# Inline comment E2E - overlapping highlights',
    '',
    targetSentence,
    '',
  ].join('\n');

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  /**
   * Local copy of the same-named helper in the "highlight color stays the
   * same across states" suite above -- kept scoped to this describe block
   * (not hoisted to module scope) to match that suite's own precedent: it,
   * too, keeps its pseudo-color reader local to its block rather than
   * sharing it across suites.
   */
  const getPseudoBackgroundColor = (
    targetPage: Page,
    text: string,
    pseudo: string,
  ): Promise<string> =>
    targetPage.evaluate(
      ({ needle, pseudoSelector }) => {
        const container = document.querySelector('.wiki');
        if (container == null) {
          throw new Error('page body container (.wiki) not found');
        }
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
        );
        let node = walker.nextNode();
        while (node != null) {
          if (node.textContent?.includes(needle)) {
            const el = node.parentElement;
            if (el == null) {
              throw new Error('matched text node has no parent element');
            }
            return window.getComputedStyle(el, pseudoSelector).backgroundColor;
          }
          node = walker.nextNode();
        }
        throw new Error(`text not found in page body: ${needle}`);
      },
      { needle: text, pseudoSelector: pseudo },
    );

  /**
   * Resolves the saved-comment token (`--grw-inline-comment-marker-bg`) to a
   * computed color via a throwaway probe element, the same technique the
   * "highlight consistency across states" suite above uses for the identical
   * purpose -- kept as its own local copy rather than shared, per that
   * suite's own precedent.
   */
  const readSavedMarkerColor = (targetPage: Page): Promise<string> =>
    targetPage.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--grw-inline-comment-marker-bg)';
      document.body.appendChild(probe);
      const color = window.getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });

  /**
   * Resolves the *applied* (already semi-transparent) pending-highlight
   * value to a computed color, via the exact same `color-mix()` expression
   * `PendingSelectionHighlight.tsx` uses for its `::selection` /
   * `::highlight(growi-inline-comment-pending)` rules (design.md decision 1:
   * "適用箇所は半透明にする" -- `color-mix(in srgb,
   * var(--grw-inline-comment-marker-bg-pending) 70%, transparent)`). Mirroring
   * the production expression here (rather than reading the raw
   * `--grw-inline-comment-marker-bg-pending` token alone) is what proves the
   * two highlight-origins resolve to genuinely different painted values, not
   * just different token names.
   */
  const readPendingAppliedColor = (targetPage: Page): Promise<string> =>
    targetPage.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor =
        'color-mix(in srgb, var(--grw-inline-comment-marker-bg-pending) 70%, transparent)';
      document.body.appendChild(probe);
      const color = window.getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });

  test('Create a page containing the target sentence', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: overlapPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);
  });

  test('Selecting text over an already-saved comment shows both highlights at once, painted with different colors', async ({
    page,
  }, testInfo) => {
    await page.goto(overlapPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    // --- Step 1: save a comment on the target sentence first. ---
    await selectTextInPageBody(page, targetSentence);
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();

    const commentText = 'a saved comment that a later selection overlaps';
    await form.locator('.cm-content').fill(commentText);
    await form.getByTestId('inline-comment-submit-button').click();
    await expect(form).not.toBeVisible();

    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();
    await expect(item).toContainText(commentText);

    // The saved highlight is registered asynchronously, once AnchorResolver
    // resolves the just-created anchor against the rendered body (same poll
    // pattern used throughout this file).
    await expect
      .poll(async () =>
        page.evaluate(
          () => CSS.highlights.get('growi-inline-comment')?.size ?? 0,
        ),
      )
      .toBeGreaterThan(0);

    // --- Step 2: make a NEW selection overlapping the same, already-saved
    // range (design.md's "本文選択の監視" / Req 1.2's overlapping-selection
    // case). Selecting the same sentence again is a straightforward,
    // guaranteed-overlapping choice: `selectTextInPageBody` already supports
    // selecting by exact text content. Merely selecting (no click on the
    // action button yet) is enough to register the pending highlight --
    // SelectionCapture renders `PendingSelectionHighlight` with
    // `range={state.liveRange}` as soon as it reaches the `selecting` stage,
    // the same "Requirement 12.4: same marker color while merely selecting"
    // state the highlight-consistency suite above exercises. ---
    await selectTextInPageBody(page, targetSentence);
    await expect(page.getByTestId('selection-action-button')).toBeVisible();

    // Requirement 1.2, decisive proof of "both shown at once": both the
    // saved highlight and the new pending highlight are simultaneously
    // registered under CSS.highlights -- not merely "a different color
    // exists somewhere", but both actively painting the same overlapping
    // range right now.
    await expect
      .poll(() =>
        page.evaluate(() => ({
          saved: CSS.highlights.get('growi-inline-comment')?.size ?? 0,
          pending:
            CSS.highlights.get('growi-inline-comment-pending')?.size ?? 0,
        })),
      )
      .toEqual({ saved: 1, pending: 1 });

    // Requirement 1.1: the two highlight-origins resolve to different raw
    // colors -- the saved token stays opaque, while the pending token's
    // applied value is composited semi-transparent (design.md decision 1).
    const savedMarkerColor = await readSavedMarkerColor(page);
    const pendingAppliedColor = await readPendingAppliedColor(page);
    // Sanity: neither resolves to fully transparent, which would make every
    // comparison below pass vacuously.
    expect(savedMarkerColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(pendingAppliedColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(pendingAppliedColor).not.toBe(savedMarkerColor);

    // Strongest, most direct proof: read what is actually painted on the
    // overlapping text at this exact moment, for both pseudo forms at once.
    // A real document selection exists right now, so CSS's own
    // highlight-painting order (`::highlight() < ::selection`, design.md
    // decision 1) puts `::selection` on top -- it must resolve to the
    // composited pending color. The saved highlight is still registered
    // underneath (confirmed above), and its own pseudo resolves to the
    // opaque saved color independently of what currently paints on top.
    const topPaintedColor = await getPseudoBackgroundColor(
      page,
      targetSentence,
      '::selection',
    );
    const savedHighlightColor = await getPseudoBackgroundColor(
      page,
      targetSentence,
      '::highlight(growi-inline-comment)',
    );
    expect(topPaintedColor).toBe(pendingAppliedColor);
    expect(savedHighlightColor).toBe(savedMarkerColor);
    expect(topPaintedColor).not.toBe(savedHighlightColor);
  });
});

test.describe('Inline comment - hover/click/tap on a saved body highlight opens a preview popover with simple reply (Req 2.1-2.5)', () => {
  // Serial: every test in this suite reuses the one saved comment created by
  // the first test, the same reasoning the other suites in this file use.
  test.describe.configure({ mode: 'serial' });

  const bodyPopoverPagePath = (retry: number) =>
    `/inline-comment-e2e-body-popover${retry}`;

  const targetSentence =
    'This sentence anchors the body-popover end-to-end test.';
  const introText = 'Some intro text before the target, hovered to move away.';
  const pageBody = [
    '# Inline comment E2E - body popover',
    '',
    introText,
    '',
    targetSentence,
    '',
    'Some trailing text after the target.',
    '',
  ].join('\n');

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  /**
   * The viewport-relative center point of the exact text run `text` --
   * located via a `TreeWalker` + a throwaway `Range` around just that text
   * (same technique `selectTextInPageBody` uses to build a selection Range,
   * reused here to read `getBoundingClientRect()` instead).
   *
   * This is deliberately NOT "hover/click the wrapping element" (e.g.
   * `locator.hover()` on the paragraph): a `.hover()`/`.click()` targets the
   * center of the ELEMENT's own box, but a block-level `<p>` spans the full
   * container width while its rendered text is left-aligned and narrower --
   * so the element's center can sit well past the end of the actual glyphs,
   * outside every rect `useHighlightHitTest`'s `getClientRects()`-based hit
   * test compares against (see `use-highlight-hit-test.ts`). Moving the mouse
   * to the middle of the TEXT's own bounding rect is what actually lands
   * inside the saved highlight's hit-testable area.
   */
  const centerOfText = (
    targetPage: Page,
    text: string,
  ): Promise<{ x: number; y: number }> =>
    targetPage.evaluate((needle) => {
      const container = document.querySelector('.wiki');
      if (container == null) {
        throw new Error('page body container (.wiki) not found');
      }
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node != null) {
        const index = node.textContent?.indexOf(needle) ?? -1;
        if (index !== -1) {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + needle.length);
          const rect = range.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
        node = walker.nextNode();
      }
      throw new Error(`text not found in page body: ${needle}`);
    }, text);

  /**
   * Moves the mouse to the middle of `text`'s own rendered rect -- the
   * `pointermove` this dispatches bubbles to `document`, which is where
   * `useHighlightHitTest`'s desktop-only hover listener is attached (the
   * saved highlight has no DOM element of its own to target directly; see
   * design.md 決定2).
   */
  const hoverText = async (targetPage: Page, text: string): Promise<void> => {
    const { x, y } = await centerOfText(targetPage, text);
    await targetPage.mouse.move(x, y);
  };

  /** Same rationale as `hoverText`, for a real click/tap at that same point. */
  const clickText = async (targetPage: Page, text: string): Promise<void> => {
    const { x, y } = await centerOfText(targetPage, text);
    await targetPage.mouse.click(x, y);
  };

  const commentText = 'a comment surfaced through the body popover';

  test('Create a page and save an inline comment on the target sentence', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: bodyPopoverPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();

    await form.locator('.cm-content').fill(commentText);
    await form.getByTestId('inline-comment-submit-button').click();
    await expect(form).not.toBeVisible();

    const item = page.getByTestId('inline-comment-item').first();
    await expect(item).toBeVisible();
    await expect(item).toContainText(commentText);

    // The saved highlight (and therefore its hit-testable Range) is only
    // registered once AnchorResolver resolves the just-created anchor -- same
    // poll pattern used throughout this file.
    await expect
      .poll(async () =>
        page.evaluate(
          () => CSS.highlights.get('growi-inline-comment')?.size ?? 0,
        ),
      )
      .toBeGreaterThan(0);
  });

  test('Desktop: hovering the highlight shows the comment content, and moving away closes it (Req 2.1, 2.4, 2.5)', async ({
    page,
  }, testInfo) => {
    // The default viewport (1400x1024, playwright.config.ts) is well above
    // Bootstrap's `md` breakpoint (768px) -- the desktop case Req 2.1 covers.
    await page.goto(bodyPopoverPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    const popover = page.getByTestId('inline-comment-preview-popover');
    await expect(popover).not.toBeVisible();

    await hoverText(page, targetSentence);
    await expect(popover).toBeVisible();
    await expect(popover).toContainText(commentText);

    // Requirement 2.5: no element for editing the origin comment's own body
    // exists anywhere in the popover -- only its (single) reply textarea.
    await expect(popover.locator('textarea')).toHaveCount(1);
    await expect(popover.getByRole('button', { name: /edit/i })).toHaveCount(0);

    // Requirement 2.4 (hover case): moving the mouse to an unrelated part of
    // the body (not merely off-screen, so the pointer's target is still
    // inside the body container and the hit test actually re-runs) drops the
    // hover-only hit, and with nothing pinning it, the popover closes.
    await hoverText(page, introText);
    await expect(popover).not.toBeVisible();
  });

  test('Desktop: clicking the highlight opens and pins the popover, which stays open once the mouse moves away (Req 2.1)', async ({
    page,
  }, testInfo) => {
    await page.goto(bodyPopoverPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    const popover = page.getByTestId('inline-comment-preview-popover');
    await clickText(page, targetSentence);
    await expect(popover).toBeVisible();
    await expect(popover).toContainText(commentText);

    // Decisive proof of "pinned": a plain hover elsewhere, which alone closes
    // a hover-only popover (proven in the previous test), does NOT close a
    // click-pinned one.
    await hoverText(page, introText);
    await expect(popover).toBeVisible();

    // Requirement 2.4: the popover's own explicit close control still works
    // on a pinned popover.
    await popover.getByRole('button', { name: 'Close' }).click();
    await expect(popover).not.toBeVisible();
  });

  test('Requirement 2.4: clicking outside the popover closes it', async ({
    page,
  }, testInfo) => {
    await page.goto(bodyPopoverPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    const popover = page.getByTestId('inline-comment-preview-popover');
    await clickText(page, targetSentence);
    await expect(popover).toBeVisible();

    await clickText(page, introText);
    await expect(popover).not.toBeVisible();
  });

  test('Requirement 2.3: submitting a reply from the popover posts it, and it appears nested under the origin item in the bottom list', async ({
    page,
  }, testInfo) => {
    await page.goto(bodyPopoverPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    const popover = page.getByTestId('inline-comment-preview-popover');
    await clickText(page, targetSentence);
    await expect(popover).toBeVisible();

    const replyText = 'a reply posted through the body popover';
    // The popover's reply input is a deliberately plain textarea (design.md
    // 決定2's "簡易な返信欄") -- not the mention-aware editor the bottom list
    // uses -- so it is driven by its placeholder/aria-label rather than the
    // shared `.cm-content` + `inline-comment-submit-button` idiom used
    // elsewhere in this file.
    await popover.getByPlaceholder('Write a reply...').fill(replyText);
    await popover.getByRole('button', { name: 'Commment' }).click();

    // The popover clears its draft and keeps itself open on a successful
    // submit (InlineCommentPreviewPopover.tsx has no self-close-on-submit
    // behavior); the decisive proof is the bottom-of-page list, the single
    // source of truth `createReply` writes to either way (design.md 決定2:
    // this popover calls the exact same `createReply` prop `PageView.tsx`
    // wires into the bottom list).
    await expect(popover.getByPlaceholder('Write a reply...')).toHaveValue('');

    const item = page.getByTestId('inline-comment-item').first();
    const reply = item.getByTestId('inline-comment-reply').last();
    await expect(reply).toBeVisible();
    await expect(reply).toContainText(replyText);
  });

  test('Tablet-and-below: tapping the highlight opens the popover (Req 2.2)', async ({
    page,
  }, testInfo) => {
    // 600px is at/below Bootstrap's `md` breakpoint (768px) -- the same
    // narrow width `sticky-features.spec.ts` uses for its own tablet/mobile
    // check. A tap and a mouse click dispatch the same `click` event in a
    // real browser, and `useHighlightHitTest` treats tablet-and-below width
    // as click-only (its `pointermove`/hover branch is desktop-only), so a
    // plain `.click()` at this viewport width IS the tap interaction under
    // test here -- no separate touch-emulation API is required.
    await page.setViewportSize({ width: 600, height: 1024 });
    await page.goto(bodyPopoverPagePath(testInfo.retry));
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    const popover = page.getByTestId('inline-comment-preview-popover');
    await expect(popover).not.toBeVisible();

    await clickText(page, targetSentence);
    await expect(popover).toBeVisible();
    await expect(popover).toContainText(commentText);
  });
});

test.describe('Inline comment - a re-anchor-failed comment never surfaces a body popover (Req 2.6)', () => {
  // Serial: the second test depends on the comment created by the first, and
  // deliberately breaks that same comment's anchor -- the same reasoning the
  // "best-effort fallback" suite above uses for its own two-test structure.
  test.describe.configure({ mode: 'serial' });

  const notFoundPopoverPagePath = (retry: number) =>
    `/inline-comment-e2e-popover-not-found${retry}`;

  // Same fixture shape as the "best-effort fallback" suite above: long enough
  // that the fuzzy matcher's tolerance cannot bridge the gap to its
  // replacement, so the anchor is deterministically `not_found` after the edit.
  const targetSentence =
    'This sentence anchors a comment whose target will be removed so the popover has nothing left to hit-test against.';
  const replacementSentence = 'Unrelated replacement text.';
  const pageBody = [
    '# Inline comment E2E - popover not-found anchor',
    '',
    'Some intro text before the target.',
    '',
    targetSentence,
    '',
    'Some trailing text after the target.',
    '',
  ].join('\n');

  let createdPage: CreatedPage | undefined;

  test.afterAll(async ({ request }) => {
    if (createdPage != null) {
      await deletePagesCompletely(request, [createdPage]);
    }
  });

  test('Create a page, then save an inline comment on the sentence that will later be removed', async ({
    page,
    request,
  }, testInfo) => {
    createdPage = await createPage(request, {
      path: notFoundPopoverPagePath(testInfo.retry),
      body: pageBody,
    });

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(targetSentence);
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    await selectTextInPageBody(page, targetSentence);
    await page.getByTestId('selection-action-button').click();
    const form = page.getByTestId('inline-comment-form');
    await expect(form).toBeVisible();

    await form
      .locator('.cm-content')
      .fill('a comment whose target will be removed');
    await form.getByTestId('inline-comment-submit-button').click();
    await expect(form).not.toBeVisible();

    await expect
      .poll(async () =>
        page.evaluate(
          () => CSS.highlights.get('growi-inline-comment')?.size ?? 0,
        ),
      )
      .toBeGreaterThan(0);
  });

  test('After the commented-on text is edited away and the page reloads, hovering/clicking where it used to be shows no popover (Req 2.6)', async ({
    page,
    request,
  }) => {
    if (createdPage == null) {
      throw new Error('createdPage was not set by the previous test');
    }

    const editedBody = pageBody.replace(targetSentence, replacementSentence);
    createdPage = await updatePage(request, createdPage, editedBody);

    await page.goto(createdPage.path);
    await expect(page.locator('.wiki').first()).toContainText(
      replacementSentence,
    );
    await expect(page.getByTestId('inline-comment-ready')).toBeAttached();

    // Requirement 2.6: the anchor could not be re-resolved (`not_found`), so
    // `rangesById()` never produces a Range for it (design.md 決定2/決定3) --
    // there is nothing left in the body to hit-test against. Confirm this
    // precondition first (no highlight drawn at all), then confirm hovering
    // and clicking the text that replaced it still surfaces no popover.
    expect(
      await page.evaluate(
        () => CSS.highlights.get('growi-inline-comment')?.size ?? 0,
      ),
    ).toBe(0);

    const popover = page.getByTestId('inline-comment-preview-popover');
    const replacementElement = page
      .locator('.wiki')
      .getByText(replacementSentence, { exact: true });

    await replacementElement.hover();
    await expect(popover).not.toBeVisible();

    await replacementElement.click();
    await expect(popover).not.toBeVisible();
  });
});
