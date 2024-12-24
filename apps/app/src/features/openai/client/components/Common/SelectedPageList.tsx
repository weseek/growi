import { memo } from 'react';

import { useTranslation } from 'react-i18next';

import type { SelectedPage } from '../../../interfaces/selected-page';

export const SelectedPageList = memo(({ selectedPages }: { selectedPages: SelectedPage[] }): JSX.Element => {
  const { t } = useTranslation();

  if (selectedPages.length === 0) {
    return <></>;
  }

  return (
    <div className="mb-3">
      {selectedPages.map(({ page, isIncludeSubPage }) => (
        <p key={page._id} className="mb-1">
          <code>{ page.path }</code>
          {isIncludeSubPage && <span className="badge rounded-pill text-bg-secondary ms-2">{t('Include Subordinated Page')}</span>}
        </p>
      ))}
    </div>
  );
});
