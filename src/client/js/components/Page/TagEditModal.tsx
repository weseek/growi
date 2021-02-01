import React, { FC, useState, useEffect } from 'react';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import TagsInput from './TagsInput';
import { Tag } from '~/interfaces/page';

type Props = {
  tags?: Tag[],
  isOpen: boolean,
  onClose: () => void,
  onTagsUpdated: <T extends Tag[]>(tags: T) => void,
}

const TagEditModal: FC<Props> = (props: Props) => {
  const [tags, setTags] = useState<Tag[]>([]);

  function onTagsUpdatedByTagsInput(tags) {
    setTags(tags);
  }

  useEffect(() => {
    if (props.tags != null) {
      setTags(props.tags);
    }
  }, [props.tags]);

  function closeModalHandler() {
    if (props.onClose == null) {
      return;
    }
    props.onClose();
  }

  function handleSubmit() {
    if (props.onTagsUpdated == null) {
      return;
    }

    props.onTagsUpdated(tags);
    closeModalHandler();
  }

  return (
    <Modal isOpen={props.isOpen} toggle={closeModalHandler} id="edit-tag-modal" autoFocus={false}>
      <ModalHeader tag="h4" toggle={closeModalHandler} className="bg-primary text-light">
        Edit Tags
      </ModalHeader>
      <ModalBody>
        <TagsInput tags={tags} onTagsUpdated={onTagsUpdatedByTagsInput} autoFocus />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
          Done
        </Button>
      </ModalFooter>
    </Modal>
  );

};

export default TagEditModal;
