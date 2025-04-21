import type { FC } from 'react';
import React, { memo } from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';

export const PrivateLegacyPagesLink: FC = memo(() => {
  const { t } = useTranslation();

  return (
    <Link href="/_private-legacy-pages" className="h5 grw-private-legacy-pages-anchor text-decoration-none" prefetch={false}>
      <span className="material-symbols-outlined me-2">bottom_drawer</span> {t('private_legacy_pages.title')}
    </Link>
  );
});

PrivateLegacyPagesLink.displayName = 'PrivateLegacyPagesLink';
