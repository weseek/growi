import { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { useAiAssistantChatSidebar } from '~/features/openai/client/stores/ai-assistant';

export const EditorAssistantToggleButton = (): JSX.Element => {
  const { t } = useTranslation();
  const { data, close } = useAiAssistantChatSidebar();
  const { isOpened } = data ?? {};

  const toggle = useCallback(() => {
    if (isOpened) {
      close();
    }
  }, [isOpened, close]);

  return (
    <button
      type="button"
      className={`btn btn-sm btn-outline-neutral-secondary py-0 ${data?.isOpened ? 'active' : ''}`}
      onClick={toggle}
    >
      <span className="d-flex align-items-center">
        <span className="growi-custom-icons py-0 fs-6">ai_assistant</span>
        <span className="ms-1 me-1">{t('page_edit.editor_assistant')}</span>
      </span>
    </button>
  );
};
