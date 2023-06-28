import React, {
  useCallback, useEffect, useState,
} from 'react';

import assert from 'assert';

import { Lang } from '@growi/core';
import type { ITemplate } from '@growi/core/dist/interfaces/template';
import type { TemplateSummary } from '@growi/pluginkit/dist/interfaces/v4';
import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { useSWRxTemplates } from '~/features/templates/stores';
import { useTemplateModal } from '~/stores/modal';
import { usePersonalSettings } from '~/stores/personal-settings';
import { usePreviewOptions } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';

import Preview from '../PageEditor/Preview';

import { useFormatter } from './use-formatter';

const logger = loggerFactory('growi:components:TemplateModal');


type TemplateRadioButtonProps = {
  templateSummary: TemplateSummary,
  onChange: (selectedTemplate: TemplateSummary) => void,
  usersDefaultLang?: Lang,
  isSelected?: boolean,
}

const TemplateRadioButton = ({
  templateSummary, onChange, usersDefaultLang, isSelected,
}: TemplateRadioButtonProps): JSX.Element => {
  const templateId = templateSummary.default.id;
  const radioButtonId = `rb-${templateId}`;

  const template = usersDefaultLang != null && usersDefaultLang in templateSummary
    ? templateSummary[usersDefaultLang]
    : templateSummary.default;

  assert(template.isValid);

  return (
    <div key={templateId} className="custom-control custom-radio mb-2">
      <input
        id={radioButtonId}
        type="radio"
        className="custom-control-input"
        checked={isSelected}
        onChange={() => onChange(templateSummary)}
      />
      <label className="custom-control-label" htmlFor={radioButtonId}>
        {template.title}
      </label>
    </div>
  );
};

export const TemplateModal = (): JSX.Element => {
  const { t } = useTranslation(['translation', 'commons']);


  const { data: templateModalStatus, close } = useTemplateModal();

  const { data: personalSettingsInfo } = usePersonalSettings();
  const { data: rendererOptions } = usePreviewOptions();
  const { data: templateSummaries } = useSWRxTemplates();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  // const [selectedTemplateLocale, setSelectedTemplateLocale] = useState<string>();

  const { format } = useFormatter();

  const submitHandler = useCallback((template?: ITemplate) => {
    if (templateModalStatus == null || selectedTemplateId == null) {
      return;
    }

    if (templateModalStatus.onSubmit == null || template == null) {
      close();
      return;
    }

    // templateModalStatus.onSubmit(format(selectedTemplate));
    close();
  }, [close, selectedTemplateId, templateModalStatus]);

  useEffect(() => {
    if (!templateModalStatus?.isOpened) {
      setSelectedTemplateId(undefined);
    }
  }, [templateModalStatus?.isOpened]);

  if (templateSummaries == null || templateModalStatus == null) {
    return <></>;
  }

  return (
    <Modal className="link-edit-modal" isOpen={templateModalStatus.isOpened} toggle={close} size="lg" autoFocus={false}>
      <ModalHeader tag="h4" toggle={close} className="bg-primary text-light">
        {t('template.modal_label.Select template')}
      </ModalHeader>

      <ModalBody className="container">
        <div className="row">
          <div className="col-12">
            { Object.entries(templateSummaries).map(([templateId, templateSummary]) => (
              <TemplateRadioButton
                key={templateId}
                templateSummary={templateSummary}
                usersDefaultLang={personalSettingsInfo?.lang}
                onChange={() => setSelectedTemplateId(templateId)}
                isSelected={templateId === selectedTemplateId}
              />
            )) }
          </div>
        </div>

        <hr />

        <h3>{t('Preview')}</h3>
        <div className='card'>
          <div className="card-body" style={{ height: '400px', overflowY: 'auto' }}>
            { rendererOptions != null && selectedTemplateId != null && (
              <Preview rendererOptions={rendererOptions} markdown={'' /* format(selectedTemplate) */}/>
            ) }
          </div>
        </div>

      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-sm btn-outline-secondary mx-1" onClick={close}>
          {t('Cancel')}
        </button>
        <button
          type="submit"
          className="btn btn-sm btn-primary mx-1"
          // onClick={() => submitHandler(selectedTemplate)}
          disabled={selectedTemplateId == null}>
          {t('commons:Insert')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
