import React, { useMemo, memo } from 'react';

import { useTranslation } from 'react-i18next';

import { type SelectablePage } from '../../../../interfaces/selectable-page';

import styles from './SelectablePagePageList.module.scss';

const moduleClass = styles['selectable-page-page-list'] ?? '';

type MethodButtonProps = {
  page: SelectablePage;
  disablePagePaths: string[];
  methodButtonColor: string;
  methodButtonIconName: string;
  onClickMethodButton: (page: SelectablePage) => void;
}

const MethodButton = memo((props: MethodButtonProps) => {
  const {
    page,
    disablePagePaths,
    methodButtonColor,
    methodButtonIconName,
    onClickMethodButton,
  } = props;

  return (
    <button
      type="button"
      className={`btn border-0 ${methodButtonColor}`}
      disabled={disablePagePaths.includes(page.path)}
      onClick={(e) => {
        e.stopPropagation();
        onClickMethodButton(page);
      }}
    >
      <span className="material-symbols-outlined">
        {methodButtonIconName}
      </span>
    </button>
  );
});


type SelectablePagePageListProps = {
  pages: SelectablePage[],
  method: 'add' | 'remove' | 'delete'
  methodButtonPosition?: 'left' | 'right',
  disablePagePaths?: string[],
  isEditable?: boolean,
  onClickMethodButton: (page: SelectablePage) => void,
}

export const SelectablePagePageList = (props: SelectablePagePageListProps): JSX.Element => {
  const {
    pages,
    method,
    methodButtonPosition = 'left',
    disablePagePaths = [],
    isEditable,
    onClickMethodButton,
  } = props;

  const { t } = useTranslation();

  const methodButtonIconName = useMemo(() => {
    switch (method) {
      case 'add':
        return 'add_circle';
      case 'remove':
        return 'do_not_disturb_on';
      case 'delete':
        return 'delete';
      default:
        return '';
    }
  }, [method]);

  const methodButtonColor = useMemo(() => {
    switch (method) {
      case 'add':
        return 'text-primary';
      case 'remove':
        return 'text-secondary';
      case 'delete':
        return 'text-secondary';
      default:
        return '';
    }
  }, [method]);


  if (pages.length === 0) {
    return (
      <div className={moduleClass}>
        <div className="border-0 text-center page-list-item rounded py-3">
          <p className="text-muted mb-0">{t('modal_ai_assistant.no_pages_selected')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`list-group ${moduleClass}`}>
      {pages.map((page) => {
        return (
          <div
            key={page.path}
            className="list-group-item border-0 page-list-item d-flex align-items-center p-1 mb-2 rounded"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >

            {methodButtonPosition === 'left'
              && (
                <MethodButton
                  page={page}
                  disablePagePaths={disablePagePaths}
                  methodButtonColor={methodButtonColor}
                  methodButtonIconName={methodButtonIconName}
                  onClickMethodButton={onClickMethodButton}
                />
              )
            }

            <div className={`flex-grow-1 ${methodButtonPosition === 'left' ? 'me-4' : 'ms-2'}`}>
              <span className={`page-path ${isEditable ? 'page-path-editable' : ''}`}>
                {page.path}
              </span>
            </div>

            <span className={`badge bg-body-secondary rounded-pill ${methodButtonPosition === 'left' ? 'me-2' : ''}`}>
              <span className="text-body-tertiary">
                {page.descendantCount}
              </span>
            </span>

            {methodButtonPosition === 'right'
              && (
                <MethodButton
                  page={page}
                  disablePagePaths={disablePagePaths}
                  methodButtonColor={methodButtonColor}
                  methodButtonIconName={methodButtonIconName}
                  onClickMethodButton={onClickMethodButton}
                />
              )
            }
          </div>
        );
      })}
    </div>
  );
};
