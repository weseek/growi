import React from 'react';

import { useTranslation } from 'next-i18next';

import { useKeywordManager } from '~/client/services/search-operation';
import { useTagEditModal } from '~/stores/modal';
import { useSWRxTagsInfo } from '~/stores/page';

import { NotAvailableForGuest } from '../NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '../NotAvailableForReadOnlyUser';

type RenderTagLabelsProps = {
  tags: string[],
  isTagLabelsDisabled: boolean,
  isDisappear: boolean,
  pageId: string,
}

const RenderTagLabels = React.memo((props: RenderTagLabelsProps) => {
  const {
    tags, isTagLabelsDisabled, isDisappear, pageId,
  } = props;
  const { t } = useTranslation();

  const { pushState } = useKeywordManager();
  const { open: openTagEditModal } = useTagEditModal();
  const { data: tagsInfoData } = useSWRxTagsInfo(pageId);

  const isTagsEmpty = tags.length === 0;

  return (
    <>
      {!isDisappear && tags.map(tag => (
        <a
          key={tag}
          type="button"
          className="grw-tag-label badge bg-primary me-2"
          onClick={() => pushState(`tag:${tag}`)}
        >
          {tag}
        </a>
      ))}
      <NotAvailableForGuest>
        <NotAvailableForReadOnlyUser>
          <div id="edit-tags-btn-wrapper-for-tooltip">
            <a
              className={
                `btn btn-link btn-edit-tags text-muted d-flex align-items-center
                ${isTagsEmpty && 'no-tags'}
                ${isTagLabelsDisabled && 'disabled'}
                ${isDisappear && 'border border-secondary p-1'}`
              }
              onClick={() => openTagEditModal(tagsInfoData?.tags)}
            >
              {isTagsEmpty && <> {t('Add tags for this page')}</>}
              <i className={`icon-plus ${isTagsEmpty && 'ms-1'}`} />
            </a>
          </div>
        </NotAvailableForReadOnlyUser>
      </NotAvailableForGuest>
    </>

  );

});

RenderTagLabels.displayName = 'RenderTagLabels';

export default RenderTagLabels;
