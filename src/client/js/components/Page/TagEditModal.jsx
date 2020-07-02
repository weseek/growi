import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import TagsInput from './TagsInput';

function TagEditModal(props) {
  const [tags, setTags] = useState(['hoge']);

  function onTagsUpdatedByTagsInput(tags) {
    setTags(tags);
  }

  function closeModalHandler() {
    if (props.onClose == null) {
      return;
    }
    props.onClose();
  }

  async function handleSubmit() {
    props.onTagsUpdated(tags);
    closeModalHandler();
  }

  return (
    <Modal isOpen={props.isOpen} toggle={closeModalHandler} id="edit-tag-modal">
      <ModalHeader tag="h4" toggle={closeModalHandler} className="bg-primary text-light">
          Edit Tags
      </ModalHeader>
      <ModalBody>
        <TagsInput tags={tags} onTagsUpdated={onTagsUpdatedByTagsInput} />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
            Done
        </Button>
      </ModalFooter>
    </Modal>
  );

}

TagEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onTagsUpdated: PropTypes.func.isRequired,
};

export default TagEditModal;
