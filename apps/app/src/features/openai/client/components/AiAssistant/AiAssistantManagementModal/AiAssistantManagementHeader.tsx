import { ModalHeader } from 'reactstrap';

import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';

export const AiAssistantManagementHeader = (): JSX.Element => {
  const { close, changePageMode } = useAiAssistantManagementModal();

  return (
    <ModalHeader
      close={(
        <button type="button" className="btn p-0" onClick={close}>
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    >
      <div className="d-flex align-items-center">
        <button type="button" className="btn p-0 me-3" onClick={() => changePageMode(AiAssistantManagementModalPageMode.HOME)}>
          <span className="material-symbols-outlined text-primary">chevron_left</span>
        </button>
        <span>アシスタントへの指示</span>
      </div>
    </ModalHeader>
  );
};
