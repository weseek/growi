import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTranslation } from 'react-i18next';

const CreateTemplateModal = (props) => {
  const { t } = props;

  return (
    <Modal size="lg" isOpen className="grw-create-page">
      <ModalHeader tag="h4" className="bg-primary text-light">
        {t('template.modal_label.Create/Edit Template Page')}
      </ModalHeader>
      <ModalBody>
      </ModalBody>
    </Modal>

  );
};


CreateTemplateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(CreateTemplateModal);
