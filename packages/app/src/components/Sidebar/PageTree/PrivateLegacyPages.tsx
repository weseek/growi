import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

const PrivateLegacyPages: FC = memo(() => {
  const { t } = useTranslation();

  return (
    <div className="grw-prvt-legacy-pages p-3">
      <a href="#" className="h5">
        <i className="fa fa-inbox mr-2"></i> PrivateLegacyPages
      </a>
    </div>
  );
});

export default PrivateLegacyPages;
