import { FC } from 'react';
import { UncontrolledTooltip } from 'reactstrap';

import { useTranslation } from '~/i18n';
import { Tag } from '~/interfaces/page';

type Props = {
  tags?: Tag[],
  isGuestUser: boolean,
  openEditorModal?: () => void,
}

const RenderTagLabels: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const {
    tags, isGuestUser,
  } = props;

  function openEditorHandler() {
    if (props.openEditorModal == null) {
      return;
    }
    props.openEditorModal();
  }

  // activate suspense
  if (tags == null) {
    throw new Promise(() => {});
  }

  const isTagsEmpty = tags.length === 0;

  const tagElements = tags.map((tag) => {
    return (
      <a key={tag.name} href={`/_search?q=tag:${tag}`} className="grw-tag-label badge badge-secondary mr-2">
        {tag}
      </a>
    );
  });

  return (
    <>
      {tagElements}

      <div id="edit-tags-btn-wrapper-for-tooltip">
        <a
          className={`btn btn-link btn-edit-tags p-0 text-muted ${isTagsEmpty ? 'no-tags' : ''} ${isGuestUser ? 'disabled' : ''}`}
          onClick={openEditorHandler}
        >
          { isTagsEmpty && <>{ t('Add tags for this page') }</>}
          <i className="ml-1 icon-plus"></i>
        </a>
      </div>
      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="edit-tags-btn-wrapper-for-tooltip" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

};

export default RenderTagLabels;
