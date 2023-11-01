import React from 'react';

import { useTranslation } from 'react-i18next';

type PageCreateButtonDropdownMenuProps = {
  onClickCreateNewPageButtonHandler: () => Promise<void>
  onClickCreateTodaysButtonHandler: () => Promise<void>
  onClickTemplateForChildrenButtonHandler: () => Promise<void>
  onClickTemplateForDescendantsButtonHandler: () => Promise<void>
}

export const PageCreateButtonDropdownMenu = React.memo((props: PageCreateButtonDropdownMenuProps): JSX.Element => {
  const {
    onClickCreateNewPageButtonHandler,
    onClickCreateTodaysButtonHandler,
    onClickTemplateForChildrenButtonHandler,
    onClickTemplateForDescendantsButtonHandler,
  } = props;

  const { t } = useTranslation('commons');

  return (
    <ul className="dropdown-menu">
      <li>
        <button
          className="dropdown-item"
          onClick={onClickCreateNewPageButtonHandler}
          type="button"
        >
          {t('create_page_dropdown.new_page')}
        </button>
      </li>
      <li><hr className="dropdown-divider" /></li>
      <li><span className="text-muted px-3">{t('create_page_dropdown.todays.desc')}</span></li>
      {/* TODO: show correct create today's page path */}
      {/* https://redmine.weseek.co.jp/issues/133893 */}
      <li>
        <button
          className="dropdown-item"
          onClick={onClickCreateTodaysButtonHandler}
          type="button"
        >
          (TBD) Create today&apos;s
        </button>
      </li>
      <li><hr className="dropdown-divider" /></li>
      <li><span className="text-muted text-nowrap px-3">{t('create_page_dropdown.template.desc')}</span></li>
      <li>
        <button
          className="dropdown-item"
          onClick={onClickTemplateForChildrenButtonHandler}
          type="button"
        >
          {t('create_page_dropdown.template.children')}
        </button>
      </li>
      <li>
        <button
          className="dropdown-item"
          onClick={onClickTemplateForDescendantsButtonHandler}
          type="button"
        >
          {t('create_page_dropdown.template.decendants')}
        </button>
      </li>
    </ul>
  );
});
PageCreateButtonDropdownMenu.displayName = 'PageCreateButtonDropdownMenu';
