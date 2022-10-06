import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';


type ITemplate = {
  name: string,
  markdown: string,
}

const templates: ITemplate[] = [
  {
    name: 'presetA',
    markdown: '## Preset',
  },
  {
    name: 'presetB',
    markdown: '### Preset',
  },
  {
    name: 'presetC',
    markdown: '#### Preset',
  },
];


const TemplateRadioButton = ({ template }: { template: ITemplate }): JSX.Element => {
  return (
    <div key={template.name} className="custom-control custom-radio">
      <input
        type="radio"
        className="custom-control-input"
        id="string"
        defaultValue={template.markdown}
        // checked={this.state.linkerType === template.value}
        // onChange={this.handleSelecteLinkerType(template.value)}
      />
      <label className="custom-control-label" htmlFor="string">
        {template.name}
      </label>
    </div>
  );
};


type Props = {
  isOpen: boolean,
  onClose: () => void,
  onSave?: (markdown: string) => void,
}

export const TemplateModal = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { isOpen, onClose, onSave } = props;

  const submitHandler = useCallback(() => {
    if (onSave == null) {
      onClose();
      return;
    }

    const markdown = '(select one)';
    onSave(markdown);
    onClose();
  }, [onClose, onSave]);

  return (
    <Modal className="link-edit-modal" isOpen={isOpen} toggle={onClose} size="lg" autoFocus={false}>
      <ModalHeader tag="h4" toggle={onClose} className="bg-primary text-light">
        Template
      </ModalHeader>

      <ModalBody className="container">
        <div className="row">
          <div className="col-12">
            { templates.map(template => <TemplateRadioButton key={template.name} template={template} />) }
          </div>
        </div>

        {/* <div className={`linkedit-preview ${styles['linkedit-preview']}`}>
          <Preview markdown={this.state.markdown}/>
        </div> */}
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-sm btn-outline-secondary mx-1" onClick={onClose}>
          {t('Cancel')}
        </button>
        <button type="submit" className="btn btn-sm btn-primary mx-1" onClick={submitHandler}>
          {t('Done')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
