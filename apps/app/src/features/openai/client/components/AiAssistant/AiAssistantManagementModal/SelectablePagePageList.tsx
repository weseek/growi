import type { IPageHasId } from '@growi/core';
import { useTranslation } from 'react-i18next';

import styles from './SelectablePagePageList.module.scss';

const moduleClass = styles['selectable-page-page-list'] ?? '';

type Props = {
  pages: IPageHasId[],
  method: 'add' | 'remove',
  disablePageIds?: string[],
  onClickMethodButton: (page: IPageHasId) => void,
}

export const SelectablePagePageList = (props: Props): JSX.Element => {
  const {
    pages, method, disablePageIds, onClickMethodButton,
  } = props;

  const { t } = useTranslation();

  if (pages.length === 0) {
    return (
      <div className={moduleClass}>
        <div className="card border-0 text-center page-list-item">
          <div className="card-body">
            <p className="text-muted mb-0">{t('modal_ai_assistant.no_pages_selected')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`list-group ${moduleClass}`}>
      {pages.map((page) => {
        return (
          <button
            key={page._id}
            type="button"
            className="list-group-item border-0 list-group-item-action page-list-item d-flex align-items-center p-1 mb-2 rounded"
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
                onClickMethodButton(page);
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
