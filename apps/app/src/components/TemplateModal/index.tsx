import React, {
  useCallback, useEffect, useState,
} from 'react';

import type { ITemplate } from '@growi/core/dist/interfaces/template';
import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { useTemplateModal } from '~/stores/modal';
import { usePreviewOptions } from '~/stores/renderer';
import { useTemplates } from '~/stores/template';
import loggerFactory from '~/utils/logger';

import Preview from '../PageEditor/Preview';

import { useFormatter } from './use-formatter';

const logger = loggerFactory('growi:components:TemplateModal');


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

export const TemplateModal = (): JSX.Element => {
  const { t } = useTranslation();


  const { data: templateModalStatus, close } = useTemplateModal();

  const { data: rendererOptions } = usePreviewOptions();
  const { data: templates } = useTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<ITemplate>();

  const { format } = useFormatter();

  const submitHandler = useCallback((template?: ITemplate) => {
    if (templateModalStatus == null || selectedTemplate == null) {
      return;
    }

    if (templateModalStatus.onSubmit == null || template == null) {
      close();
      return;
    }

    templateModalStatus.onSubmit(format(selectedTemplate));
    close();
  }, [close, format, selectedTemplate, templateModalStatus]);

  useEffect(() => {
    if (!templateModalStatus?.isOpened) {
      setSelectedTemplate(undefined);
    }
  }, [templateModalStatus?.isOpened]);

  if (templates == null || templateModalStatus == null) {
    return <></>;
  }

  return (
    <Modal className="link-edit-modal" isOpen={templateModalStatus.isOpened} toggle={close} size="lg" autoFocus={false}>
      <ModalHeader tag="h4" toggle={close} className="bg-primary text-light">
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

        { rendererOptions != null && selectedTemplate != null && (
          <>
            <hr />
            <h3>Preview</h3>
            <div className='card'>
              <div className="card-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <Preview rendererOptions={rendererOptions} markdown={format(selectedTemplate)}/>
              </div>
            </div>
          </>
        ) }

      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-sm btn-outline-secondary mx-1" onClick={close}>
          {t('Cancel')}
        </button>
        <button type="submit" className="btn btn-sm btn-primary mx-1" onClick={() => submitHandler(selectedTemplate)} disabled={selectedTemplate == null}>
          {t('Update')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
