
import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';

const PageAccessoriesModal = (props) => {
  // const { pageContainer } = props;

  return (
    <Modal
      size="lg"
      // isOpen={.isOpen}
      // toggle={.onClose}
      className="grw-create-page"
    >
      <ModalHeader tag="h4" className="bg-primary text-light">
        TopOfTableContentsModal
      </ModalHeader>
      <ModalBody>
      </ModalBody>
    </Modal>

  );
};


/**
 * Wrapper component for using unstated
 */
const PageAccessoriesModalWrapper = withUnstatedContainers(PageAccessoriesModal, []);


PageAccessoriesModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  // appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  topOfTableContents: PropTypes.instanceOf().isRequired,
};

export default withTranslation()(PageAccessoriesModalWrapper);
