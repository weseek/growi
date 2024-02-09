import React from 'react';

import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownItem } from 'reactstrap';

import type { LabelType } from '~/interfaces/template';


type DropendMenuProps = {
  onClickCreateNewPageButton: () => Promise<void>
  onClickCreateTodaysButton: () => Promise<void>
  onClickTemplateButton?: (label: LabelType) => Promise<void>
  todaysPath: string | null,
}

export const DropendMenu = React.memo((props: DropendMenuProps): JSX.Element => {
  const {
    onClickCreateNewPageButton,
    onClickCreateTodaysButton,
    onClickTemplateButton,
    todaysPath,
  } = props;

  const { t } = useTranslation('commons');

  return (
    <DropdownMenu
      container="body"
    >
      <DropdownItem
        onClick={onClickCreateNewPageButton}
      >
        {t('create_page_dropdown.new_page')}
      </DropdownItem>

      { todaysPath != null && (
        <>
          <DropdownItem divider />
          <li><span className="text-muted px-3">{t('create_page_dropdown.todays.desc')}</span></li>
          <DropdownItem
            onClick={onClickCreateTodaysButton}
          >
            {todaysPath}
          </DropdownItem>
        </>
      )}

      { onClickTemplateButton != null && (
        <>
          <DropdownItem divider />
          <li><span className="text-muted text-nowrap px-3">{t('create_page_dropdown.template.desc')}</span></li>
          <DropdownItem
            onClick={() => onClickTemplateButton('_template')}
          >
            {t('create_page_dropdown.template.children')}
          </DropdownItem>
          <DropdownItem
            onClick={() => onClickTemplateButton('__template')}
          >
            {t('create_page_dropdown.template.descendants')}
          </DropdownItem>
        </>
      ) }
    </DropdownMenu>
  );
});
DropendMenu.displayName = 'DropendMenu';
