import { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { IQuestionnaireOrderHasId } from '~/interfaces/questionnaire/questionnaire-order';
import { useCurrentUser } from '~/stores/context';
import { useQuestionnaireModal } from '~/stores/modal';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:QuestionnaireToast');

type QuestionnaireToastProps = {
  questionnaireOrder: IQuestionnaireOrderHasId,
}

const QuestionnaireToast = ({ questionnaireOrder }: QuestionnaireToastProps): JSX.Element => {
  const { open: openQuestionnaireModal } = useQuestionnaireModal();
  const { data: currentUser } = useCurrentUser();
  const lang = currentUser?.lang;

  const [isOpen, setIsOpen] = useState(true);

  const { t } = useTranslation();

  const answerBtnClickHandler = useCallback(() => {
    setIsOpen(false);
    openQuestionnaireModal(questionnaireOrder._id);
  }, [openQuestionnaireModal, questionnaireOrder._id]);

  const denyBtnClickHandler = useCallback(async() => {
    // Immediately close
    setIsOpen(false);

    try {
      await apiv3Put('/questionnaire/deny', {
        questionnaireOrderId: questionnaireOrder._id,
      });
      toastSuccess(t('questionnaire.denied'));
    }
    catch (e) {
      logger.error(e);
    }
  }, [questionnaireOrder._id, t]);

  // No showing toasts since not important
  const closeBtnClickHandler = useCallback(async() => {
    setIsOpen(false);

    try {
      await apiv3Put('/questionnaire/skip', {
        questionnaireOrderId: questionnaireOrder._id,
      });
    }
    catch (e) {
      logger.error(e);
    }
  }, [questionnaireOrder._id]);

  const questionnaireOrderShortTitle = lang === 'en_US' ? questionnaireOrder.shortTitle.en_US : questionnaireOrder.shortTitle.ja_JP;

  return <div className={`toast ${isOpen ? 'show' : 'hide'}`}>
    <div className="toast-header bg-info">
      <strong className="mr-auto text-light">{questionnaireOrderShortTitle}</strong>
      <button type="button" className="ml-2 mb-1 close" onClick={closeBtnClickHandler}>
        <span aria-hidden="true" className="text-light">&times;</span>
      </button>
    </div>
    <div className="toast-body bg-light d-flex justify-content-end">
      <button type="button" className="btn btn-secondary mr-3" onClick={answerBtnClickHandler}>{t('questionnaire.answer')}</button>
      <button type="button" className="btn btn-secondary" onClick={denyBtnClickHandler}>{t('questionnaire.skip')}</button>
    </div>
  </div>;
};

export default QuestionnaireToast;
