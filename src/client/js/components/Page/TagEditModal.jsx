import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import TagsInput from './TagsInput';

function TagEditModal(props) {
  const [tags, setTags] = useState([]);

  function onTagsUpdatedByTagsInput(tags) {
    setTags(tags);
  }

  useEffect(() => {
    setTags(props.tags);
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
    <Modal isOpen={props.isOpen} toggle={closeModalHandler} id="edit-tag-modal">
      <ModalHeader tag="h4" toggle={closeModalHandler} className="bg-primary text-light">
        Edit Tags
      </ModalHeader>
      <ModalBody>
        <TagsInput tags={tags} onTagsUpdated={onTagsUpdatedByTagsInput} />
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          Done
        </button>
      </ModalFooter>
    </Modal>
  );

}

TagEditModal.propTypes = {
  tags: PropTypes.array,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onTagsUpdated: PropTypes.func,
};

export default TagEditModal;
