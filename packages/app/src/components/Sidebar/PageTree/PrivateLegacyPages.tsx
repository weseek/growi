import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

const PrivateLegacyPages: FC = memo(() => {
  const { t } = useTranslation();

  return (
    <a href="/private-legacy-pages?q=[nq:PrivateLegacyPages]" className="h5 grw-private-legacy-pages-anchor text-decoration-none">
      <i className="icon-drawer mr-2"></i> {t('pagetree.private_legacy_pages')}
    </a>
  );
});

export default PrivateLegacyPages;
