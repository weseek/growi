import React, { useState, useEffect, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { TagsInput } from './TagsInput';

type Props = {
  tags: string[],
  isOpen: boolean,
  onClose?: () => void,
  onTagsUpdated?: (tags: string[]) => Promise<void> | void,
};

function TagEditModal(props: Props): JSX.Element {
  const { onClose, onTagsUpdated } = props;

  const [tags, setTags] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    setTags(props.tags);
  }, [props.tags]);

  const closeModalHandler = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (onTagsUpdated == null) {
      return;
    }

    onTagsUpdated(tags);
    closeModalHandler();
  }, [closeModalHandler, onTagsUpdated, tags]);

  return (
    <Modal isOpen={props.isOpen} toggle={closeModalHandler} id="edit-tag-modal" autoFocus={false}>
      <ModalHeader tag="h4" toggle={closeModalHandler} className="bg-primary text-light">
        {t('tag_edit_modal.edit_tags')}
      </ModalHeader>
      <ModalBody>
        <TagsInput tags={tags} onTagsUpdated={tags => setTags(tags)} autoFocus />
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          {t('tag_edit_modal.done')}
        </button>
      </ModalFooter>
    </Modal>
  );

}

export default TagEditModal;
