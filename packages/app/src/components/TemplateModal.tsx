import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';


const presetA = {
  name: 'presetA',
  value: '## Preset',
};

const presetB = {
  name: 'presetB',
  value: '### Preset',
};

const presetC = {
  name: 'presetC',
  value: '#### Preset',
};

const templates = [presetA, presetB, presetC];


type Props = {
  onSave: (markdown: string) => void,
}

export const TemplateModal = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { onSave } = props;

  const [isOpen, setOpen] = useState(false);

  const submitHandler = useCallback(() => {
    if (onSave == null) {
      return;
    }

    const markdown = '(select one)';
    onSave(markdown);
  }, [onSave]);

  return (
    <Modal className="link-edit-modal" isOpen={isOpen} toggle={() => setOpen(false)} size="lg" autoFocus={false}>
      <ModalHeader tag="h4" toggle={() => setOpen(false)} className="bg-primary text-light">
        Template
      </ModalHeader>

      <ModalBody className="container">
        <div className="row">
          <div className="col-12">
            { templates.map(template => <TemplateRadioButton template={template} />) }
          </div>
        </div>

        {/* <div className={`linkedit-preview ${styles['linkedit-preview']}`}>
          <Preview markdown={this.state.markdown}/>
        </div> */}
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-sm btn-outline-secondary mx-1" onClick={() => setOpen(false)}>
          {t('Cancel')}
        </button>
        <button type="submit" className="btn btn-sm btn-primary mx-1" onClick={submitHandler}>
          {t('Done')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
