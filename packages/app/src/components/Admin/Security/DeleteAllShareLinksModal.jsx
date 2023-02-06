import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const DeleteAllShareLinksModal = React.memo((props) => {
  const { t } = props;

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
          {t('security_settings.delete_all_share_links')}
        </span>
      </ModalHeader>
      <ModalBody>
        { t('security_settings.share_link_notice')}
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeButtonHandler}>{t('Cancel')}</Button>
        <Button color="danger" onClick={deleteAllLinkHandler}>
          <i className="icon icon-fire"></i>
          {t('Delete')}
        </Button>
      </ModalFooter>
    </Modal>
  );

});
DeleteAllShareLinksModal.displayName = 'DeleteAllShareLinksModal';


DeleteAllShareLinksModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onClickDeleteButton: PropTypes.func,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const DeleteAllShareLinksModalWrapperFC = (props) => {
  const { t } = useTranslation('admin');

  return <DeleteAllShareLinksModal t={t} {...props} />;
};

export default DeleteAllShareLinksModalWrapperFC;
