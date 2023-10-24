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
  pageId: string,
  revisionId: string,
}

const RenderTagLabels = React.memo((props: RenderTagLabelsProps) => {
  const {
    tags, isTagLabelsDisabled, pageId, revisionId,
  } = props;
  const { t } = useTranslation();

  const { pushState } = useKeywordManager();
  const { open: openTagEditModal } = useTagEditModal();
  const { data: tagsInfoData } = useSWRxTagsInfo(pageId);

  const isTagsEmpty = tags.length === 0;

  return (
    <>
      {tags.map((tag) => {
        return (
          <a
            key={tag}
            type="button"
            className="grw-tag-label badge bg-primary me-2"
            onClick={() => pushState(`tag:${tag}`)}
          >
            {tag}
          </a>
        );
      })}
      <NotAvailableForGuest>
        <NotAvailableForReadOnlyUser>
          <div id="edit-tags-btn-wrapper-for-tooltip">
            <a
              className={
                `btn btn-link btn-edit-tags text-muted d-flex align-items-center
                ${isTagsEmpty && 'no-tags'}
                ${isTagLabelsDisabled && 'disabled'}`
              }
              onClick={() => openTagEditModal(tagsInfoData?.tags, pageId, revisionId)}
            >
              {isTagsEmpty && <>{ t('Add tags for this page') }</>}
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
