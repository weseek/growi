import React, {
  useCallback, useEffect, useState,
} from 'react';

import assert from 'assert';

import { Lang } from '@growi/core';
import type { TemplateSummary } from '@growi/pluginkit/dist/v4';
import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { useSWRxTemplate, useSWRxTemplates } from '~/features/templates/stores';
import { useTemplateModal } from '~/stores/modal';
import { usePersonalSettings } from '~/stores/personal-settings';
import { usePreviewOptions } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';

import Preview from '../PageEditor/Preview';

import { useFormatter } from './use-formatter';

const logger = loggerFactory('growi:components:TemplateModal');


function constructTemplateId(templateSummary: TemplateSummary): string {
  const defaultTemplate = templateSummary.default;

  return `${defaultTemplate.pluginId ?? ''}_${defaultTemplate.id}`;
}


type TemplateRadioButtonProps = {
  templateSummary: TemplateSummary,
  onClick?: () => void,
  usersDefaultLang?: Lang,
  isSelected?: boolean,
}

const TemplateListGroupItem = ({
  templateSummary, onClick, usersDefaultLang, isSelected,
}: TemplateRadioButtonProps): JSX.Element => {
  const templateId = constructTemplateId(templateSummary);
  const locales = new Set(Object.values(templateSummary).map(s => s.locale));

  const template = usersDefaultLang != null && usersDefaultLang in templateSummary
    ? templateSummary[usersDefaultLang]
    : templateSummary.default;

  assert(template.isValid);

  return (
    <a
      key={templateId}
      className={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
      onClick={onClick}
      aria-current="true"
    >
      <h4 className="mb-1">{template.title}</h4>
      <p className="mb-2">{template.desc}</p>
      { Array.from(locales).map(locale => (
        <span key={locale} className="badge border rounded-pill text-muted mr-1">{locale}</span>
      ))}
    </a>
  );
};

export const TemplateModal = (): JSX.Element => {
  const { t } = useTranslation(['translation', 'commons']);


  const { data: templateModalStatus, close } = useTemplateModal();

  const { data: personalSettingsInfo } = usePersonalSettings();
  const { data: rendererOptions } = usePreviewOptions();
  const { data: templateSummaries } = useSWRxTemplates();

  const [selectedTemplateSummary, setSelectedTemplateSummary] = useState<TemplateSummary>();
  const [selectedTemplateLocale, setSelectedTemplateLocale] = useState<string>();

  const { data: selectedTemplateMarkdown } = useSWRxTemplate(selectedTemplateSummary, selectedTemplateLocale);

  const { format } = useFormatter();

  const submitHandler = useCallback((markdown?: string) => {
    if (templateModalStatus == null || markdown == null) {
      return;
    }

    if (templateModalStatus.onSubmit == null) {
      close();
      return;
    }

    templateModalStatus.onSubmit(format(selectedTemplateMarkdown));
    close();
  }, [close, format, selectedTemplateMarkdown, templateModalStatus]);

  useEffect(() => {
    if (!templateModalStatus?.isOpened) {
      setSelectedTemplateSummary(undefined);
    }
  }, [templateModalStatus?.isOpened]);

  if (templateSummaries == null || templateModalStatus == null) {
    return <></>;
  }

  return (
    <Modal className="link-edit-modal" isOpen={templateModalStatus.isOpened} toggle={close} size="xl" autoFocus={false}>
      <ModalHeader tag="h4" toggle={close} className="bg-primary text-light">
        {t('template.modal_label.Select template')}
      </ModalHeader>

      <ModalBody className="container">
        <div className="row">
          <div className="d-none d-lg-block col-lg-4">
            <div className="list-group">
              { templateSummaries.map((templateSummary) => {
                const templateId = constructTemplateId(templateSummary);

                return (
                  <TemplateListGroupItem
                    key={templateId}
                    templateSummary={templateSummary}
                    usersDefaultLang={personalSettingsInfo?.lang}
                    onClick={() => setSelectedTemplateSummary(templateSummary)}
                    isSelected={selectedTemplateSummary != null && constructTemplateId(selectedTemplateSummary) === templateId}
                  />
                );
              }) }
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <h3>{t('Preview')}</h3>
            <div className='card'>
              <div className="card-body" style={{ height: '400px', overflowY: 'auto' }}>
                { rendererOptions != null && selectedTemplateSummary != null && (
                  <Preview rendererOptions={rendererOptions} markdown={format(selectedTemplateMarkdown)}/>
                ) }
              </div>
            </div>
          </div>
        </div>

      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-outline-secondary mx-1" onClick={close}>
          {t('Cancel')}
        </button>
        <button
          type="submit"
          className="btn btn-primary mx-1"
          onClick={() => submitHandler(selectedTemplateMarkdown)}
          disabled={selectedTemplateSummary == null}>
          {t('commons:Insert')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
