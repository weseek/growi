import { PageGrant } from '@growi/core';

import {
  buildLinkPreview,
  type LinkPreviewPageSource,
} from './link-preview-mapper';

const page = (
  grant: PageGrant | null,
  overrides: Partial<LinkPreviewPageSource> = {},
): LinkPreviewPageSource => ({
  grant,
  path: '/team/onboarding',
  body: 'x'.repeat(3000),
  updatedAt: new Date('2026-01-15T09:30:00.000Z'),
  commentCount: 4,
  ...overrides,
});

describe('buildLinkPreview', () => {
  it('gives a full summary for a publicly readable page in an open GROWI', () => {
    const result = buildLinkPreview(page(PageGrant.GRANT_PUBLIC), true);

    expect(result.restricted).toBe(false);
    expect(result.path).toBe('/team/onboarding');
    expect(result.excerpt).toBe('x'.repeat(2000));
    expect(result.updatedAt).toBe('2026-01-15T09:30:00.000Z');
    expect(result.commentCount).toBe(4);
  });

  it('gives path-only for a non-public (GRANT_OWNER) page even in an open GROWI', () => {
    const result = buildLinkPreview(page(PageGrant.GRANT_OWNER), true);

    expect(result).toEqual({ path: '/team/onboarding', restricted: true });
  });

  it('gives path-only for a GRANT_PUBLIC page in a CLOSED GROWI -- the closed-GROWI gate applies even to a publicly-graned page (design.md: "リンクの展開...パスだけにする", no public-grant exception stated)', () => {
    const result = buildLinkPreview(page(PageGrant.GRANT_PUBLIC), false);

    expect(result).toEqual({ path: '/team/onboarding', restricted: true });
  });

  it('gives path-only for a non-public page in a closed GROWI (both gates fail)', () => {
    const result = buildLinkPreview(page(PageGrant.GRANT_SPECIFIED), false);

    expect(result).toEqual({ path: '/team/onboarding', restricted: true });
  });

  it('treats a legacy null-grant page the same as GRANT_PUBLIC', () => {
    const result = buildLinkPreview(page(null), true);

    expect(result.restricted).toBe(false);
  });

  it('never includes excerpt/updatedAt/commentCount when restricted', () => {
    const result = buildLinkPreview(page(PageGrant.GRANT_RESTRICTED), true);

    expect(result.excerpt).toBeUndefined();
    expect(result.updatedAt).toBeUndefined();
    expect(result.commentCount).toBeUndefined();
  });

  it('truncates a long body to 2000 characters, not the full body', () => {
    const longBody = 'a'.repeat(5000);
    const result = buildLinkPreview(
      page(PageGrant.GRANT_PUBLIC, { body: longBody }),
      true,
    );

    expect(result.excerpt).toHaveLength(2000);
  });

  it('does not truncate a body shorter than the limit', () => {
    const shortBody = 'hello world';
    const result = buildLinkPreview(
      page(PageGrant.GRANT_PUBLIC, { body: shortBody }),
      true,
    );

    expect(result.excerpt).toBe(shortBody);
  });
});
