import React from 'react';

import { useAiAssistantManegementModal } from '../../../stores/ai-assistant';

import styles from './AiAssistantSubstance.module.scss';

const moduleClass = styles['grw-ai-assistant-substance'] ?? '';

export const AiAssistantContent = (): JSX.Element => {
  const { open } = useAiAssistantManegementModal();

  return (
    <div className={moduleClass}>
      <button
        type="button"
        className="btn btn-outline-secondary px-3 d-flex align-items-center mb-3"
        onClick={open}
      >
        <span className="material-symbols-outlined fs-5 me-2">add</span>
        <span className="fw-normal">アシスタントを追加する</span>
      </button>

      <div className="py-4 d-flex">
        <h3 className="fw-bold mb-0 grw-ai-assistant-substance-header">
          マイアシスタント
        </h3>
      </div>

      <div className="py-4 d-flex">
        <h3 className="fw-bold mb-0 grw-ai-assistant-substance-header">
          チームアシスタント
        </h3>
      </div>
    </div>
  );
};
