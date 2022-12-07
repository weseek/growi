import React from 'react';

import { useTranslation } from 'next-i18next';
import { UncontrolledTooltip } from 'reactstrap';

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
    <div className='d-flex align-items-center'>
      {tags.map((tag) => {
        return (
          <a key={tag} href={`/_search?q=tag:${tag}`} className="ml-2 grw-tag-label badge badge-secondary">
            {tag}
          </a>
        );
      })}
      <div id="edit-tags-btn-wrapper-for-tooltip">
        <a
          className={`p-0 btn btn-link btn-edit-tags text-muted d-flex align-items-center
          ${isTagsEmpty ? 'ml-2 no-tags' : ''} ${isGuestUser ? 'disabled' : ''}`}
          onClick={openEditorHandler}
        >
          { isTagsEmpty && <>{ t('Add tags for this page') }</>}
          <span className="ml-2 icon-plus"/>
        </a>
      </div>
      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="edit-tags-btn-wrapper-for-tooltip" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </div>
  );

});

RenderTagLabels.displayName = 'RenderTagLabels';

export default RenderTagLabels;
