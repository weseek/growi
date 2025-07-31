import React, {
  useRef, useMemo, useCallback, useState, type KeyboardEvent,
} from 'react';

import type { IPageHasId } from '@growi/core';
import { type TypeaheadRef, Typeahead } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';
import {
  ModalBody,
} from 'reactstrap';

import { useSWRxSearch } from '~/stores/search';

import {
  useAiAssistantManagementModal, AiAssistantManagementModalPageMode,
} from '../../../stores/ai-assistant';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';

import styles from './AiAssistantManagementKeywordSearch.module.scss';

const moduleClass = styles['grw-ai-assistant-keyword-search'] ?? '';

type SelectedSearchKeyword = {
  id: string
  label: string
}

const isSelectedSearchKeyword = (value: unknown): value is SelectedSearchKeyword => {
  return (value as SelectedSearchKeyword).label != null;
};

export const AiAssistantKeywordSearch = (): JSX.Element => {
  const [selectedSearchKeywords, setSelectedSearchKeywords] = useState<Array<SelectedSearchKeyword>>([]);
  const [selectedPages, setSelectedPages] = useState<Array<IPageHasId>>([]);
  console.log('selectedPages', selectedPages);

  const joinedSelectedSearchKeywords = useMemo(() => {
    return selectedSearchKeywords.map(item => item.label).join(' ');
  }, [selectedSearchKeywords]);

  const { t } = useTranslation();
  const { data: searchResult } = useSWRxSearch(joinedSelectedSearchKeywords, null, {
    limit: 10,
    offset: 0,
    includeUserPages: true,
    includeTrashPages: false,
  });

  const shownSearchResult = useMemo(() => {
    return selectedSearchKeywords.length > 0 && searchResult != null && searchResult.data.length > 0;
  }, [searchResult, selectedSearchKeywords.length]);

  const { data: aiAssistantManagementModalData } = useAiAssistantManagementModal();
  const isNewAiAssistant = aiAssistantManagementModalData?.aiAssistantData == null;

  const typeaheadRef = useRef<TypeaheadRef>(null);

  const changeHandler = useCallback((selected: Array<SelectedSearchKeyword>) => {
    setSelectedSearchKeywords(selected);
  }, []);

  const keyDownHandler = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.code !== 'Space') {
      return;
    }

    if (selectedSearchKeywords.length >= 5) {
      return;
    }

    event.preventDefault();

    // fix: https://redmine.weseek.co.jp/issues/140689
    // "event.isComposing" is not supported
    const isComposing = event.nativeEvent.isComposing;
    if (isComposing) {
      return;
    }

    const initialItem = typeaheadRef?.current?.state?.initialItem;
    const handleMenuItemSelect = typeaheadRef?.current?._handleMenuItemSelect;
    if (initialItem == null || handleMenuItemSelect == null) {
      return;
    }

    if (!isSelectedSearchKeyword(initialItem)) {
      return;
    }

    const allLabels = selectedSearchKeywords.map(item => item.label);
    if (allLabels.includes(initialItem.label)) {
      return;
    }

    handleMenuItemSelect(initialItem, event);
  }, [selectedSearchKeywords]);

  const addPageHandler = useCallback((page: IPageHasId) => {
    setSelectedPages((prevSelectedPages) => {
      if (prevSelectedPages.some(selectedPage => selectedPage._id === page._id)) {
        return prevSelectedPages;
      }
      return [...prevSelectedPages, page];
    });
  }, []);

  return (
    <div className={moduleClass}>
      <AiAssistantManagementHeader
        backButtonColor="secondary"
        backToPageMode={AiAssistantManagementModalPageMode.PAGE_SELECTION_METHOD}
        labelTranslationKey={isNewAiAssistant ? 'modal_ai_assistant.header.add_new_assistant' : 'modal_ai_assistant.header.update_assistant'}
      />

      <ModalBody className="px-4">
        <h4 className="text-center fw-bold mb-3 mt-2">
          {t('modal_ai_assistant.search_reference_pages_by_keyword')}
        </h4>

        <div className="px-4">
          <Typeahead
            allowNew
            multiple
            options={[]}
            selected={selectedSearchKeywords}
            placeholder={t('modal_ai_assistant.enter_keywords')}
            id="ai-assistant-keyword-search"
            ref={typeaheadRef}
            onChange={changeHandler}
            onKeyDown={keyDownHandler}
          />

          <label htmlFor="ai-assistant-keyword-search" className="form-text text-muted mt-2">
            {t('modal_ai_assistant.max_items_space_separated_hint')}
          </label>
        </div>

        { shownSearchResult && (
          <>
            <h4 className="text-center fw-bold mb-4 mt-5">
              {t('modal_ai_assistant.select_assistant_reference_pages')}
            </h4>

            <div className="px-4 list-group">
              {searchResult?.data.map((page) => {
                return (
                  <button
                    type="button"
                    className="list-group-item list-group-item-action d-flex align-items-center p-1 mb-2 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <button
                      type="button"
                      className="btn text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        addPageHandler(page.data);
                      }}
                    >
                      <span className="material-symbols-outlined">
                        add_circle
                      </span>
                    </button>
                    <div className="flex-grow-1">
                      <span>
                        {page.data.path}
                      </span>
                    </div>
                    <span className="badge bg-body-secondary rounded-pill me-2">
                      <span className="text-body-tertiary">
                        {page.data.descendantCount}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <h4 className="text-center fw-bold mb-4 mt-3">
              {t('modal_ai_assistant.reference_pages')}
            </h4>

          </>
        )}
      </ModalBody>
    </div>
  );
};
