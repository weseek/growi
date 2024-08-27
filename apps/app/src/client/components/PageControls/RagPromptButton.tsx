import React, { useCallback } from 'react';

import { useRagPromptModal } from '~/stores/rag-prompt';

import styles from './RagPromptButton.module.scss';

const RagPromptButton = (): JSX.Element => {

  const { open: openRagPromptModal } = useRagPromptModal();

  const ragPromptButtonClickHandler = useCallback(() => {
    openRagPromptModal();
  }, [openRagPromptModal]);


  return (
    <button
      type="button"
      className={`btn btn-search ${styles['btn-rag-prompt']}`}
      onClick={ragPromptButtonClickHandler}
      data-testid="open-search-modal-button"
    >
      <span className="material-symbols-outlined">chat</span>
    </button>
  );
};

export default RagPromptButton;
