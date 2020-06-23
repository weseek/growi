import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const DeleteAllShareLinksModal = (props) => {

  function closeButtonHandler() {
    if (props.onClose == null) {
      return;
    }

    props.onClose();
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
        x 件の ShareLink 削除します
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeButtonHandler}>Cancel</Button>
        {/* <Button color="danger" onClick={this.props.confirmedToDelete}>
          <i className="icon icon-fire"></i>
            Delete
        </Button> */}
      </ModalFooter>
    </Modal>
  );
};

DeleteAllShareLinksModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

};

export default withTranslation()(DeleteAllShareLinksModal);
