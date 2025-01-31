import React from 'react';

import { useAiAssistantManagementModal } from '../../../stores/ai-assistant';

export const AiAssistantContent = (): JSX.Element => {
  const { open } = useAiAssistantManagementModal();

  return (
    <div>
      <button type="button" className="btn btn-primary" onClick={open}>
        アシスタントを追加する
        {/* TODO i18n */}
      </button>
    </div>
  );
};
