import React, { FC } from 'react';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { pathUtils } from 'growi-commons';
import urljoin from 'url-join';
import { useTranslation } from '~/i18n';

/**
 * @param {string} target Which hierarchy to create [children, decendants]
 */
// eslint-disable-next-line react/prop-types
const TemplateCard = ({ target, label, parentPath }) => {
  const { t } = useTranslation();

  function generateUrl(label) {
    return encodeURI(urljoin(parentPath, label, '#edit'));
  }

  return (
    <div className="card card-select-template">
      <div className="card-header">{ t(`template.${target}.label`) }</div>
      <div className="card-body">
        <p className="text-center"><code>{label}</code></p>
        <p className="form-text text-muted text-center"><small>{t(`template.${target}.desc`) }</small></p>
      </div>
      <div className="card-footer text-center">
        <a
          href={generateUrl(label)}
          className="btn btn-sm btn-primary"
          id={`template-button-${target}`}
        >
          { t('Edit') }
        </a>
      </div>
    </div>
  );
};

type Props = {
  isOpen: boolean;
  onClose:() => void;
  path?: string;
}

const CreateTemplateModal:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const parentPath = pathUtils.addTrailingSlash(props.path);

  return (
    <Modal isOpen={props.isOpen} toggle={props.onClose}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
        {t('template.modal_label.Create/Edit Template Page')}
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label className="mb-4">
            <code>{parentPath}</code><br />
            { t('template.modal_label.Create template under') }
          </label>
          <div className="card-deck">
            <TemplateCard target="children" label="_template" parentPath={parentPath} />
            <TemplateCard target="decendants" label="__template" parentPath={parentPath} />
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CreateTemplateModal;
