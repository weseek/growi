import React from 'react';

import { useTranslation } from 'next-i18next';

import { NotAvailableForGuest } from '../NotAvailableForGuest';

type RenderTagLabelsProps = {
  tags: string[],
  isGuestUser: boolean,
  openEditorModal?: () => void,
}

const RenderTagLabels = React.memo((props: RenderTagLabelsProps) => {
  const { tags, isGuestUser, openEditorModal } = props;
  const { t } = useTranslation();

  function openEditorHandler() {
    if (openEditorModal == null) {
      return;
    }
    openEditorModal();
  }

  const isTagsEmpty = tags.length === 0;

  return (
    <>
      {tags.map((tag) => {
        return (
          <a key={tag} href={`/_search?q=tag:${tag}`} className="grw-tag-label badge badge-secondary mr-2">
            {tag}
          </a>
        );
      })}
      <NotAvailableForGuest>
        <div id="edit-tags-btn-wrapper-for-tooltip">
          <a
            className={`btn btn-link btn-edit-tags text-muted p-0 d-flex align-items-center ${isTagsEmpty && 'no-tags'} ${isGuestUser && 'disabled'}`}
            onClick={openEditorHandler}
          >
            { isTagsEmpty && <>{ t('Add tags for this page') }</>}
            <i className={`icon-plus ${isTagsEmpty && 'ml-1'}`}/>
          </a>
        </div>
      </NotAvailableForGuest>
    </>

  );

});

RenderTagLabels.displayName = 'RenderTagLabels';

export default RenderTagLabels;
