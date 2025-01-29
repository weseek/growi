import { ModalHeader } from 'reactstrap';

import { useAiAssistantManegementModal, AiAssistantManegementModalPageMode } from '../../../stores/ai-assistant';

export const AiAssistantManagementHeader = (): JSX.Element => {
  const { close, changePageMode } = useAiAssistantManegementModal();

  return (
    <ModalHeader
      close={(
        <button type="button" className="btn p-0" onClick={close}>
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    >
      <div className="d-flex align-items-center">
        <button type="button" className="btn p-0 me-3" onClick={() => changePageMode(AiAssistantManegementModalPageMode.HOME)}>
          <span className="material-symbols-outlined text-primary">chevron_left</span>
        </button>
        <span>アシスタントへの指示</span>
      </div>
    </ModalHeader>
  );
};
