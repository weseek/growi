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
    <>
      {tags.map((tag) => {
        return (
          <a key={tag} href={`/_search?q=tag:${tag}`} className="ml-2 grw-tag-label badge badge-secondary">
            {tag}
          </a>
        );
      })}
      <div id="edit-tags-btn-wrapper-for-tooltip">
        <a
          className={`btn btn-link btn-edit-tags text-muted ${isTagsEmpty ? 'px-2 no-tags' : 'p-0'} ${isGuestUser && 'disabled'}`}
          onClick={openEditorHandler}
        >
          { isTagsEmpty && <span>{ t('Add tags for this page') }</span>}
          <span className={'ml-1 icon-plus'}/>
        </a>
      </div>
      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="edit-tags-btn-wrapper-for-tooltip" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

});

RenderTagLabels.displayName = 'RenderTagLabels';

export default RenderTagLabels;
