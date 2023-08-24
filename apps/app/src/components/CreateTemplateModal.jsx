import React from 'react';

import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import urljoin from 'url-join';

const CreateTemplateModal = (props) => {
  const { t } = useTranslation();
  const { path } = props;

  const parentPath = pathUtils.addTrailingSlash(path);

  function generateUrl(label) {
    return encodeURI(urljoin(parentPath, label, '#edit'));
  }

  /**
   * @param {string} target Which hierarchy to create [children, decendants]
   */
  function renderTemplateCard(target, label) {
    return (
      <div className="card card-select-template">
        <div className="card-header">{ t(`template.${target}.label`) }</div>
        <div className="card-body">
          <p className="text-center"><code>{label}</code></p>
          <p className="form-text text-muted text-center"><small>{t(`template.${target}.desc`) }</small></p>
        </div>
        <div className="card-footer text-center">
          <a
            data-testid={`template-button-${target}`}
            href={generateUrl(label)}
            className="btn btn-sm btn-primary"
            id={`template-button-${target}`}
          >
            { t('Edit') }
          </a>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={props.isOpen} toggle={props.onClose} data-testid="page-template-modal">
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
        {t('template.modal_label.Create/Edit Template Page')}
      </ModalHeader>
      <ModalBody>
        <div>
          <label className="form-label mb-4">
            <code>{parentPath}</code><br />
            { t('template.modal_label.Create template under') }
          </label>
          <div className="card-deck">
            {renderTemplateCard('children', '_template')}
            {renderTemplateCard('decendants', '__template')}
          </div>
        </div>
      </ModalBody>
    </Modal>

  );
};

CreateTemplateModal.propTypes = {
  path: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateTemplateModal;
