import React, { useState, useEffect } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import Modal from 'reactstrap/es/Modal';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import ModalHeader from 'reactstrap/es/ModalHeader';

import TagsInput from './TagsInput';

function TagEditModal(props) {
  const [tags, setTags] = useState([]);
  const { t } = useTranslation();

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
    <Modal isOpen={props.isOpen} toggle={closeModalHandler} id="edit-tag-modal" autoFocus={false}>
      <ModalHeader tag="h4" toggle={closeModalHandler} className="bg-primary text-light">
        {t('tag_edit_modal.edit_tags')}
      </ModalHeader>
      <ModalBody>
        <TagsInput tags={tags} onTagsUpdated={onTagsUpdatedByTagsInput} autoFocus />
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          {t('tag_edit_modal.done')}
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
