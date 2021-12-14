import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

const PrivateLegacyPages: FC = memo(() => {
  const { t } = useTranslation();

  return (
    <a href="/private-legacy-pages?q=[nq:PrivateLegacyPages]" className="h5">
      <i className="icon-drawer mr-2"></i> Private Legacy Pages
    </a>
  );
});

export default PrivateLegacyPages;
