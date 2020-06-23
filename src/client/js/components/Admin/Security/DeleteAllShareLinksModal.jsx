import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const DeleteAllShareLinksModal = React.memo((props) => {


  function closeModal() {
    if (props.onClose == null) {
      return;
    }

    props.onClose();
  }

  function deleteAllLinkHandler() {
    if (props.onClickDeleteButton == null) {
      return;
    }

    props.onClickDeleteButton();

    closeModal();
  }

  function closeButtonHandler() {
    closeModal();
  }

  return (
    <Modal isOpen={props.isOpen} toggle={closeButtonHandler} className="page-comment-delete-modal">
      <ModalHeader tag="h4" toggle={closeButtonHandler} className="bg-danger text-light">
        <span>
          <i className="icon-fw icon-fire"></i>
            Delete All Share links
        </span>
      </ModalHeader>
      <ModalBody>
        {props.count} 件の ShareLink 削除します
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeButtonHandler}>Cancel</Button>
        <Button color="danger" onClick={deleteAllLinkHandler}>
          <i className="icon icon-fire"></i>
            Delete
        </Button>
      </ModalFooter>
    </Modal>
  );

});

DeleteAllShareLinksModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  count: PropTypes.number.isRequired,
  onClickDeleteButton: PropTypes.func,
};

export default withTranslation()(DeleteAllShareLinksModal);
