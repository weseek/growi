import { useTranslation } from 'react-i18next';
import {
  ModalBody,
} from 'reactstrap';

import { AiAssistantManagementModalPageMode, useAiAssistantManagementModal } from '../../../stores/ai-assistant';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';


export const AiAssistantManagementPageTreeSelection = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: aiAssistantManagementModalData, changePageMode } = useAiAssistantManagementModal();
  const isNewAiAssistant = aiAssistantManagementModalData?.aiAssistantData == null;

  return (
    <>
      <AiAssistantManagementHeader
        backButtonColor="secondary"
        backToPageMode={AiAssistantManagementModalPageMode.PAGE_SELECTION_METHOD}
        labelTranslationKey={isNewAiAssistant ? 'modal_ai_assistant.header.add_new_assistant' : 'modal_ai_assistant.header.update_assistant'}
      />

      <ModalBody className="px-4">
        <h4 className="text-center fw-bold mb-3 mt-2">
          {t('modal_ai_assistant.search_reference_pages_by_keyword')}
        </h4>


        <div className="d-flex justify-content-center mt-4">
          <button
            type="button"
            className="btn btn-primary rounded next-button"
            style={{ width: '30%' }}
          >
            {t('modal_ai_assistant.next')}
          </button>
        </div>
      </ModalBody>

    </>
  );
};
