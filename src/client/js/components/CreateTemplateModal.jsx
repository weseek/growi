import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTranslation } from 'react-i18next';
import { pathUtils } from 'growi-commons';
import { createSubscribedElement } from './UnstatedUtils';

import PageContainer from '../services/PageContainer';

const CreateTemplateModal = (props) => {
  const { t, pageContainer } = props;

  const { path } = pageContainer.state;
  const parentPath = pathUtils.addTrailingSlash(path);

  return (
    <Modal isOpen className="grw-create-page">
      <ModalHeader tag="h4" className="bg-primary text-light">
        {t('template.modal_label.Create/Edit Template Page')}
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label className="mb-4">
            <code>{parentPath}</code><br />
            { t('template.modal_label.Create template under') }
          </label>
          <div className="row">
            <div className="col-md-6">
              <div className="card card-select-template">
                <div className="card-header">{ t('template.children.label') }</div>
                <div className="card-body">
                  <p className="text-center"><code>_template</code></p>
                  <p className="form-text text-muted text-center"><small>{t('template.children.desc') }</small></p>
                </div>
                <div className="card-footer text-center">
                  <a
                    href="{{templateParentPath}}_template#edit"
                    className="btn btn-sm btn-primary"
                    id="template-button-children"
                  >
                    { t('Edit') }
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card card-select-template">
                <div className="card-header">{ t('template.decendants.label') }</div>
                <div className="card-body">
                  <p className="text-center"><code>__template</code></p>
                  <p className="form-text text-muted text-center"><small>{ t('template.decendants.desc') }</small></p>
                </div>
                <div className="card-footer text-center">
                  <a
                    href="{{templateParentPath}}__template#edit"
                    className="btn btn-sm btn-primary"
                    id="template-button-decendants"
                  >
                    { t('Edit') }
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>

  );
};


/**
 * Wrapper component for using unstated
 */
const CreateTemplateModalWrapper = (props) => {
  return createSubscribedElement(CreateTemplateModal, props, [PageContainer]);
};


CreateTemplateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(CreateTemplateModalWrapper);
