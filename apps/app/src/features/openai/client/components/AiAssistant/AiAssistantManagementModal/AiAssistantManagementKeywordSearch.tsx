
import { useTranslation } from 'react-i18next';
import {
  ModalBody,
} from 'reactstrap';

import {
  useAiAssistantManagementModal, AiAssistantManagementModalPageMode,
} from '../../../stores/ai-assistant';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';


export const AiAssistantKeywordSearch = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: aiAssistantManagementModalData } = useAiAssistantManagementModal();
  const isNewAiAssistant = aiAssistantManagementModalData?.aiAssistantData == null;

  return (
    <>
      <AiAssistantManagementHeader
        backButtonColor="secondary"
        backToPageMode={AiAssistantManagementModalPageMode.PAGE_SELECTION_METHOD}
        labelTranslationKey={isNewAiAssistant ? 'modal_ai_assistant.header.add_new_assistant' : 'modal_ai_assistant.header.update_assistant'}
      />

      <ModalBody className="px-4">
        <h4 className="text-center mb-4 fw-bold">
          {t('modal_ai_assistant.search_reference_pages_by_keyword')}
        </h4>
      </ModalBody>
    </>
  );
};
