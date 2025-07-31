import type { IPageHasId } from '@growi/core';

import styles from './SelectablePagePageList.module.scss';

const moduleClass = styles['selectable-page-page-list'] ?? '';

type Props = {
  pages: IPageHasId[],
  method: 'add' | 'remove',
  disablePageIds?: string[],
  onClick: (page: IPageHasId) => void,
}

export const SelectablePagePageList = (props: Props): JSX.Element => {
  const {
    pages, method, disablePageIds, onClick,
  } = props;

  return (
    <div className={`list-group ${moduleClass}`}>
      {pages.map((page) => {
        return (
          <button
            key={page._id}
            type="button"
            className="list-group-item border-0 list-group-item-action d-flex align-items-center p-1 mb-2 rounded"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              className={`btn border-0 ${method === 'add' ? 'text-primary' : 'text-secondary'}`}
              disabled={disablePageIds?.includes(page._id)}
              onClick={(e) => {
                e.stopPropagation();
                onClick(page);
              }}
            >
              <span className="material-symbols-outlined">
                { method === 'add' ? 'add_circle' : 'do_not_disturb_on' }
              </span>
            </button>
            <div className="flex-grow-1">
              <span>
                {page.path}
              </span>
            </div>
            <span className="badge bg-body-secondary rounded-pill me-2">
              <span className="text-body-tertiary">
                {page.descendantCount}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
