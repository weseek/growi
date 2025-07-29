import type { KeyboardEvent } from 'react';
import React, { useRef, useCallback } from 'react';

import type { TypeaheadRef } from 'react-bootstrap-typeahead';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';
import {
  ModalBody,
} from 'reactstrap';

import {
  useAiAssistantManagementModal, AiAssistantManagementModalPageMode,
} from '../../../stores/ai-assistant';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';

import styles from './AiAssistantManagementKeywordSearch.module.scss';

const moduleClass = styles['grw-ai-assistant-keyword-search'] ?? '';

export const AiAssistantKeywordSearch = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: aiAssistantManagementModalData } = useAiAssistantManagementModal();
  const isNewAiAssistant = aiAssistantManagementModalData?.aiAssistantData == null;

  const typeaheadRef = useRef<TypeaheadRef>(null);

  const keyDownHandler = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.code === 'Space') {
      event.preventDefault();

      // fix: https://redmine.weseek.co.jp/issues/140689
      // "event.isComposing" is not supported
      const isComposing = event.nativeEvent.isComposing;
      if (isComposing) {
        return;
      }

      const initialItem = typeaheadRef?.current?.state?.initialItem;
      const handleMenuItemSelect = typeaheadRef?.current?._handleMenuItemSelect;

      if (initialItem != null && handleMenuItemSelect != null) {
        handleMenuItemSelect(initialItem, event);
      }
    }
  }, []);

  return (
    <div className={moduleClass}>
      <AiAssistantManagementHeader
        backButtonColor="secondary"
        backToPageMode={AiAssistantManagementModalPageMode.PAGE_SELECTION_METHOD}
        labelTranslationKey={isNewAiAssistant ? 'modal_ai_assistant.header.add_new_assistant' : 'modal_ai_assistant.header.update_assistant'}
      />

      <ModalBody className="px-4">
        <h4 className="text-center mb-4 fw-bold">
          {t('modal_ai_assistant.search_reference_pages_by_keyword')}
        </h4>

        <Typeahead
          allowNew
          multiple
          options={[]}
          placeholder={t('modal_ai_assistant.enter_keywords')}
          id="ai-assistant-keyword-search"
          ref={typeaheadRef}
          onKeyDown={keyDownHandler}
          isLoading={false}
        />

        <label htmlFor="ai-assistant-keyword-search" className="form-text text-muted mt-2">
          {t('modal_ai_assistant.max_items_space_separated_hint')}
        </label>
      </ModalBody>
    </div>
  );
};
