// TODO: 後で消す
import { memo } from 'react';

import type { SelectedPage } from '../../../../interfaces/selected-page';

type SelectedPageListProps = {
  selectedPages: SelectedPage[];
  onRemove?: (pagePath?: string) => void;
};

const SelectedPageListBase: React.FC<SelectedPageListProps> = ({ selectedPages, onRemove }: SelectedPageListProps) => {
  if (selectedPages.length === 0) {
    return <></>;
  }

  return (
    <div className="mb-3">
      {selectedPages.map(({ page, isIncludeSubPage }) => (
        <div
          key={page.path}
          className="mb-2 d-flex justify-content-between align-items-center bg-body-tertiary rounded py-2 px-3"
        >
          <div className="d-flex align-items-center overflow-hidden text-body">
            { isIncludeSubPage
              ? <>{`${page.path}/*`}</>
              : <>{page.path}</>
            }
          </div>
          {onRemove != null && page.path != null && (
            <button
              type="button"
              className="btn p-0 ms-3 text-body-secondary"
              onClick={() => onRemove(page.path)}
            >
              <span className="material-symbols-outlined fs-4">delete</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export const SelectedPageList = memo(SelectedPageListBase);
