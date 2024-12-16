import React from 'react';

import { useKnowledgeAssistantModal } from '../../stores/knowledge-assistant';

export const KnowledgeAssistantContent = (): JSX.Element => {
  const { open } = useKnowledgeAssistantModal();

  return (
    <div>
      <button type="button" className="btn btn-primary" onClick={open}>
        アシスタントを追加する
      </button>
    </div>
  );
};
