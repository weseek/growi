import React, { useCallback, useMemo } from 'react';

import { NotAvailable } from '~/client/components/NotAvailable';
import { NotAvailableForGuest } from '~/client/components/NotAvailableForGuest';
import { useIsAiEnabled } from '~/stores-universal/context';

import { useAiAssistantChatSidebar, useSWRxAiAssistants } from '../../stores/ai-assistant';

import styles from './OpenDefaultAiAssistantButton.module.scss';

const OpenDefaultAiAssistantButton = (): JSX.Element => {
  const { data: isAiEnabled } = useIsAiEnabled();
  const { data: aiAssistantData } = useSWRxAiAssistants();
  const { open: openAiAssistantChatSidebar } = useAiAssistantChatSidebar();

  const defaultAiAssistant = useMemo(() => {
    if (aiAssistantData == null) {
      return null;
    }

    const allAiAssistants = [...aiAssistantData.myAiAssistants, ...aiAssistantData.teamAiAssistants];
    return allAiAssistants.find(aiAssistant => aiAssistant.isDefault);
  }, [aiAssistantData]);

  const openDefaultAiAssistantButtonClickHandler = useCallback(() => {
    if (defaultAiAssistant == null) {
      return;
    }

    openAiAssistantChatSidebar(defaultAiAssistant);
  }, [defaultAiAssistant, openAiAssistantChatSidebar]);

  if (!isAiEnabled) {
    return <></>;
  }

  return (
    <NotAvailableForGuest>
      <NotAvailable isDisabled={defaultAiAssistant == null} title="デフォルトのAIアシスタントが設定されていません">
        <button
          type="button"
          className={`btn btn-search ${styles['btn-open-default-ai-assistant']}`}
          onClick={openDefaultAiAssistantButtonClickHandler}
          id="open-default-ai-assistant-button"
          disabled={defaultAiAssistant == null}
        >
          <span className="growi-custom-icons fs-4 align-middle lh-1">ai_assistant</span>
        </button>
      </NotAvailable>
    </NotAvailableForGuest>
  );
};

export default OpenDefaultAiAssistantButton;
