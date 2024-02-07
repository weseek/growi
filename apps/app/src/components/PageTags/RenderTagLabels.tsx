import React from 'react';

import { useTranslation } from 'next-i18next';

import { useKeywordManager } from '~/client/services/search-operation';

import { NotAvailableForGuest } from '../NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '../NotAvailableForReadOnlyUser';

type RenderTagLabelsProps = {
  tags: string[],
  isTagLabelsDisabled: boolean,
  onClickEditTagsButton: () => void,
  tagLabelsMaxWidth?: number
}

const RenderTagLabels = React.memo((props: RenderTagLabelsProps) => {
  const {
    tags, isTagLabelsDisabled, onClickEditTagsButton, tagLabelsMaxWidth,
  } = props;
  const { t } = useTranslation();

  const { pushState } = useKeywordManager();

  const isTagsEmpty = tags.length === 0;

  return (
    <div className="d-flex flex-wrap align-items-center">
      {tags.map((tag) => {
        return (
          <a
            key={tag}
            type="button"
            className="grw-tag badge me-1 mb-1 text-truncate"
            style={{ maxWidth: tagLabelsMaxWidth }}
            onClick={() => pushState(`tag:${tag}`)}
          >
            {tag}
          </a>
        );
      })}
      <NotAvailableForGuest>
        <NotAvailableForReadOnlyUser>
          <div id="edit-tags-btn-wrapper-for-tooltip" className="d-print-none">
            <a
              className={
                `btn btn-link btn-edit-tags text-muted d-flex align-items-center py-0
                ${isTagsEmpty ? 'no-tags' : 'mb-1'}
                ${isTagLabelsDisabled && 'disabled'}`
              }
              onClick={onClickEditTagsButton}
            >
              {isTagsEmpty && <>{ t('Add tags for this page') }</>}
              <i className={`icon-plus ${isTagsEmpty && 'ms-1'}`} />
            </a>
          </div>
        </NotAvailableForReadOnlyUser>
      </NotAvailableForGuest>
    </div>
  );

});

RenderTagLabels.displayName = 'RenderTagLabels';

export default RenderTagLabels;
