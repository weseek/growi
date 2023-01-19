import { useState } from 'react';

import { useTranslation } from 'next-i18next';

import { IQuestionnaireOrderHasId } from '~/interfaces/questionnaire/questionnaire-order';
import { useCurrentUser } from '~/stores/context';
import { useQuestionnaireModal } from '~/stores/modal';


type QuestionnaireToastProps = {
  questionnaireOrder: IQuestionnaireOrderHasId,
}

const QuestionnaireToast = ({ questionnaireOrder }: QuestionnaireToastProps): JSX.Element => {
  const { open: openQuestionnaireModal } = useQuestionnaireModal();
  const { data: currentUser } = useCurrentUser();
  const lang = currentUser?.lang;

  const [isOpen, setIsOpen] = useState(true);

  const { t } = useTranslation();

  const answerBtnClickHandler = () => {
    setIsOpen(false);
    openQuestionnaireModal(questionnaireOrder._id);
  };

  const questionnaireOrderTitle = lang === 'en_US' ? questionnaireOrder.title.en_US : questionnaireOrder.title.ja_JP;

  return <div className={`toast ${isOpen ? 'show' : 'hide'}`}>
    <div className="toast-header bg-info">
      <strong className="mr-auto text-light">{questionnaireOrderTitle}</strong>
      <button type="button" className="ml-2 mb-1 close" onClick={() => setIsOpen(false)}>
        <span aria-hidden="true" className="text-light">&times;</span>
      </button>
    </div>
    <div className="toast-body bg-light d-flex justify-content-end">
      <button type="button" className="btn btn-secondary mr-3" onClick={answerBtnClickHandler}>{t('questionnaire.answer')}</button>
      <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>{t('questionnaire.skip')}</button>
    </div>
  </div>;
};

export default QuestionnaireToast;
