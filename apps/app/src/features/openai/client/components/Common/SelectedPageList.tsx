import type { FC } from 'react';
import { memo } from 'react';

import { useTranslation } from 'react-i18next';

import type { SelectedPage } from '../../../interfaces/selected-page';

type SelectedPageListProps = {
  selectedPages: SelectedPage[];
  onRemove?: (pageId?: string) => void;
};

const SelectedPageListBase: FC<SelectedPageListProps> = ({ selectedPages, onRemove }) => {
  const { t } = useTranslation();

  if (selectedPages.length === 0) {
    return <></>;
  }

  return (
    <div className="mb-3">
      {selectedPages.map(({ page, isIncludeSubPage }) => (
        <div key={page._id} className="mb-1 d-flex align-items-center">
          <code>{ page.path }</code>
          {isIncludeSubPage && <span className="badge rounded-pill text-bg-secondary ms-2">{t('Include Subordinated Page')}</span>}
          {onRemove != null && page._id != null && page._id && (
            <button className="btn border-0 " type="button" onClick={() => onRemove(page._id)}>
              <span className="fs-5 material-symbols-outlined text-secondary">delete</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export const SelectedPageList = memo(SelectedPageListBase);
