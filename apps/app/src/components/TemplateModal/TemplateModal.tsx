import React, {
  useCallback, useEffect, useState,
} from 'react';

import assert from 'assert';

import { Lang } from '@growi/core';
import {
  getTemplateLocales, getLocalizedTemplate, type TemplateSummary, type TemplateStatus,
} from '@growi/pluginkit/dist/v4';
import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

import { useSWRxTemplate, useSWRxTemplates } from '~/features/templates/stores';
import { useTemplateModal, type TemplateModalStatus } from '~/stores/modal';
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

type TemplateItemProps = {
  templateId: string,
  onClick: () => void,
  isSelected: boolean,
  localizedTemplate?: TemplateStatus,
  templateLocales?: Set<string>,
}

const TemplateItem: React.FC<TemplateItemProps> = ({
  templateId,
  onClick,
  isSelected,
  localizedTemplate,
  templateLocales,
}) => {

  assert(localizedTemplate?.isValid);

  return (
    <a
      key={templateId}
      className={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
      onClick={onClick}
      aria-current="true"
    >
      <h4 className="mb-1">{localizedTemplate.title}</h4>
      <p className="mb-2">{localizedTemplate.desc}</p>
      { templateLocales != null && Array.from(templateLocales).map(locale => (
        <span key={locale} className="badge border rounded-pill text-muted mr-1">{locale}</span>
      ))}
    </a>
  );
};

type TemplateMenuProps = {
  templateSummaries: TemplateSummary[],
  onClickHandler: (templateSummary: TemplateSummary) => void,
  usersDefaultLang?: Lang,
  selectedTemplateSummary?: TemplateSummary,
}

const TemplateMenu: React.FC<TemplateMenuProps> = ({
  templateSummaries,
  onClickHandler,
  usersDefaultLang,
  selectedTemplateSummary,
}) => {
  return (
    <>
      {templateSummaries.map((templateSummary) => {
        const templateId = constructTemplateId(templateSummary);
        const isSelected = selectedTemplateSummary != null && constructTemplateId(selectedTemplateSummary) === templateId;
        const localizedTemplate = getLocalizedTemplate(templateSummary, undefined, usersDefaultLang);
        const templateLocales = getTemplateLocales(templateSummary);

        return (
          <TemplateItem
            key={templateId}
            templateId={templateId}
            onClick={() => onClickHandler(templateSummary)}
            isSelected={isSelected}
            localizedTemplate={localizedTemplate}
            templateLocales={templateLocales}
          />
        );
      })}
    </>
  );
};

type TemplateModalSubstanceProps = {
  templateModalStatus: TemplateModalStatus,
  close: () => void,
}

const TemplateModalSubstance = (props: TemplateModalSubstanceProps): JSX.Element => {
  const { templateModalStatus, close } = props;

  const { t } = useTranslation(['translation', 'commons']);

  const { data: personalSettingsInfo } = usePersonalSettings();
  const { data: rendererOptions } = usePreviewOptions();
  const { data: templateSummaries } = useSWRxTemplates();

  const [selectedTemplateSummary, setSelectedTemplateSummary] = useState<TemplateSummary>();
  const [selectedTemplateLocale, setSelectedTemplateLocale] = useState<string>();

  const { data: selectedTemplateMarkdown } = useSWRxTemplate(selectedTemplateSummary, selectedTemplateLocale);

  const { format } = useFormatter();

  const usersDefaultLang = personalSettingsInfo?.lang;
  const selectedLocalizedTemplate = getLocalizedTemplate(selectedTemplateSummary, undefined, usersDefaultLang);
  const selectedTemplateLocales = getTemplateLocales(selectedTemplateSummary);

  const submitHandler = useCallback((markdown?: string) => {
    if (markdown == null) {
      return;
    }

    if (templateModalStatus.onSubmit == null) {
      close();
      return;
    }

    templateModalStatus.onSubmit(format(selectedTemplateMarkdown));
    close();
  }, [close, format, selectedTemplateMarkdown, templateModalStatus]);

  const onClickHandler = useCallback((
      templateSummary: TemplateSummary,
  ) => {
    let localeToSet: string | Lang | undefined;

    if (selectedTemplateLocale != null && selectedTemplateLocale in templateSummary) {
      localeToSet = selectedTemplateLocale;
    }
    else if (usersDefaultLang != null && usersDefaultLang in templateSummary) {
      localeToSet = usersDefaultLang;
    }
    else {
      localeToSet = undefined;
    }

    setSelectedTemplateLocale(localeToSet);
    setSelectedTemplateSummary(templateSummary);
  }, [selectedTemplateLocale, usersDefaultLang]);

  useEffect(() => {
    if (!templateModalStatus.isOpened) {
      setSelectedTemplateSummary(undefined);
      setSelectedTemplateLocale(undefined);
    }
  }, [templateModalStatus.isOpened]);

  if (templateSummaries == null) {
    return <></>;
  }

  return (
    <>
      <ModalHeader tag="h4" toggle={close} className="bg-primary text-light">
        {t('template.modal_label.Select template')}
      </ModalHeader>
      <ModalBody className="container">
        <div className="row">
          {/* List Group */}
          <div className="d-none d-lg-block col-lg-4">
            <div className="list-group">
              <TemplateMenu
                templateSummaries={templateSummaries}
                onClickHandler={onClickHandler}
                usersDefaultLang={usersDefaultLang}
                selectedTemplateSummary={selectedTemplateSummary}
              />
            </div>
          </div>
          {/* Dropdown */}
          <div className='d-lg-none col mb-3'>
            <UncontrolledDropdown>
              <DropdownToggle caret type="button" outline className='w-100 text-right'>
                <span className="float-left">
                  {selectedLocalizedTemplate != null && selectedLocalizedTemplate.isValid
                    ? selectedLocalizedTemplate.title
                    : t('Select template')}
                </span>
              </DropdownToggle>
              <DropdownMenu role="menu" className='p-0'>
                <TemplateMenu
                  templateSummaries={templateSummaries}
                  onClickHandler={onClickHandler}
                  usersDefaultLang={usersDefaultLang}
                  selectedTemplateSummary={selectedTemplateSummary}
                />
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
          <div className="col-12 col-lg-8">
            <div className='row mb-2 mb-lg-0'>
              <div className="col-6">
                <h3>{t('preview')}</h3>
              </div>
              <div className="col-6 d-flex justify-content-end">
                <UncontrolledDropdown>
                  <DropdownToggle caret type="button" outline className='float-right' disabled={selectedTemplateSummary == null}>
                    <span className="float-left">{selectedTemplateLocale != null ? selectedTemplateLocale : t('Language')}</span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu" role="menu">
                    { selectedTemplateLocales != null && Array.from(selectedTemplateLocales).map((locale) => {
                      return (
                        <DropdownItem
                          key={locale}
                          onClick={() => setSelectedTemplateLocale(locale)}>
                          <span>{locale}</span>
                        </DropdownItem>
                      );
                    }) }
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </div>
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
    </>
  );
};


export const TemplateModal = (): JSX.Element => {
  const { data: templateModalStatus, close } = useTemplateModal();

  if (templateModalStatus == null) {
    return <></>;
  }

  return (
    <Modal className="link-edit-modal" isOpen={templateModalStatus.isOpened} toggle={close} size="xl" autoFocus={false}>
      { templateModalStatus.isOpened && (
        <TemplateModalSubstance templateModalStatus={templateModalStatus} close={close} />
      ) }
    </Modal>
  );
};
