
import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';
import TopOfTableContents from './TopOfTableContents';

const PageAccessoriesModal = (props) => {
  const { topOfTableContents } = props;

  return (
    <Modal
      size="lg"
      isOpen={topOfTableContents.isOpen}
      toggle={topOfTableContents.onClose}
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
const PageAccessoriesModalWrapper = withUnstatedContainers(PageAccessoriesModal, [TopOfTableContents]);


PageAccessoriesModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  // appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  topOfTableContents: PropTypes.instanceOf(TopOfTableContents).isRequired,
};

export default withTranslation()(PageAccessoriesModalWrapper);
