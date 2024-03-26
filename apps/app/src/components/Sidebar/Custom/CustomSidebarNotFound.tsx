import { useCallback } from 'react';

import { Origin } from '@growi/core';
import { useTranslation } from 'react-i18next';

import { useCreatePageAndTransit } from '~/client/services/create-page';

export const SidebarNotFound = (): JSX.Element => {
  const { t } = useTranslation();

  const { createAndTransit } = useCreatePageAndTransit();

  const clickCreateButtonHandler = useCallback(async() => {
    createAndTransit({ path: '/Sidebar', wip: false, origin: Origin.View });
  }, [createAndTransit]);

  return (
    <div>
      <button type="button" className="btn btn-lg btn-link" onClick={clickCreateButtonHandler}>
        <span className="material-symbols-outlined">edit_note</span>
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: t('Create Sidebar Page') }}></span>
      </button>
    </div>
  );
};
