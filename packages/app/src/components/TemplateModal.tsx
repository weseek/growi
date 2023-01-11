import React, { useCallback, useState } from 'react';

import { ITemplate } from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { usePreviewOptions } from '~/stores/renderer';
import { useTemplates } from '~/stores/template';

import Preview from './PageEditor/Preview';


type TemplateRadioButtonProps = {
  template: ITemplate,
  onChange: (selectedTemplate: ITemplate) => void,
  isSelected?: boolean,
}

const TemplateRadioButton = ({ template, onChange, isSelected }: TemplateRadioButtonProps): JSX.Element => {
  const radioButtonId = `rb-${template.id}`;

  return (
    <div key={template.id} className="custom-control custom-radio mb-2">
      <input
        id={radioButtonId}
        type="radio"
        className="custom-control-input"
        checked={isSelected}
        onChange={() => onChange(template)}
      />
      <label className="custom-control-label" htmlFor={radioButtonId}>
        {template.name}
      </label>
    </div>
  );
};


type Props = {
  isOpen: boolean,
  onClose: () => void,
  onSubmit?: (markdown: string) => void,
}

export const TemplateModal = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { isOpen, onClose, onSubmit } = props;

  const { data: rendererOptions } = usePreviewOptions();
  const { data: templates } = useTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<ITemplate>();

  const submitHandler = useCallback((template?: ITemplate) => {
    if (onSubmit == null || template == null) {
      onClose();
      return;
    }

    onSubmit(template.markdown);
    onClose();
  }, [onClose, onSubmit]);

  if (templates == null) {
    return <></>;
  }

  return (
    <Modal className="link-edit-modal" isOpen={isOpen} toggle={onClose} size="lg" autoFocus={false}>
      <ModalHeader tag="h4" toggle={onClose} className="bg-primary text-light">
        Template
      </ModalHeader>

      <ModalBody className="container">
        <div className="row">
          <div className="col-12">
            { templates.map(template => (
              <TemplateRadioButton
                key={template.id}
                template={template}
                onChange={t => setSelectedTemplate(t)}
                isSelected={template.id === selectedTemplate?.id}
              />
            )) }
          </div>
        </div>

        { rendererOptions != null && (
          <>
            <hr />
            <h3>Preview</h3>
            <div className='card'>
              <div className="card-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <Preview rendererOptions={rendererOptions} markdown={selectedTemplate?.markdown}/>
              </div>
            </div>
          </>
        ) }

      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-sm btn-outline-secondary mx-1" onClick={onClose}>
          {t('Cancel')}
        </button>
        <button type="submit" className="btn btn-sm btn-primary mx-1" onClick={() => submitHandler(selectedTemplate)} disabled={selectedTemplate == null}>
          {t('Update')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
