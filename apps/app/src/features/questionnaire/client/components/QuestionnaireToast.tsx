import { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess } from '~/client/util/toastr';
import { useQuestionnaireModal } from '~/features/questionnaire/client/stores/model';
import { useCurrentUser } from '~/stores/context';
import loggerFactory from '~/utils/logger';

import { StatusType } from '../../interfaces/questionnaire-answer-status';
import { IQuestionnaireOrderHasId } from '../../interfaces/questionnaire-order';
import { GuestQuestionnaireAnswerStatusService } from '../services/guest-questionnaire-answer-status';

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
    openQuestionnaireModal(questionnaireOrder._id, () => setIsOpen(false));
  }, [openQuestionnaireModal, questionnaireOrder._id]);

  const denyBtnClickHandler = useCallback(async() => {
    // Immediately close
    setIsOpen(false);

    try {
      await apiv3Put('/questionnaire/deny', {
        questionnaireOrderId: questionnaireOrder._id,
      });
      if (currentUser == null) {
        GuestQuestionnaireAnswerStatusService.setStatus(questionnaireOrder._id, StatusType.denied);
      }
      toastSuccess(t('questionnaire.denied'));
    }
    catch (e) {
      logger.error(e);
    }
  }, [questionnaireOrder._id, t, currentUser]);

  // No showing toasts since not important
  const closeBtnClickHandler = useCallback(async() => {
    setIsOpen(false);

    try {
      await apiv3Put('/questionnaire/skip', {
        questionnaireOrderId: questionnaireOrder._id,
      });
      if (currentUser == null) {
        GuestQuestionnaireAnswerStatusService.setStatus(questionnaireOrder._id, StatusType.skipped);
      }
    }
    catch (e) {
      logger.error(e);
    }
  }, [questionnaireOrder._id, currentUser]);

  const questionnaireOrderShortTitle = lang === 'en_US' ? questionnaireOrder.shortTitle.en_US : questionnaireOrder.shortTitle.ja_JP;

  return (
    <div className={`toast ${isOpen ? 'show' : 'hide'}`}>
      <div className="toast-header bg-primary">
        <strong className="mr-auto text-light">{questionnaireOrderShortTitle}</strong>
        <button type="button" className="ml-2 mb-1 btn-close" onClick={closeBtnClickHandler} aria-label="Close"></button>
      </div>
      <div className="toast-body bg-light d-flex justify-content-end">
        <button type="button" className="btn btn-secondary mr-3" onClick={answerBtnClickHandler}>{t('questionnaire.answer')}</button>
        <button type="button" className="btn btn-secondary" onClick={denyBtnClickHandler}>{t('questionnaire.deny')}</button>
      </div>
    </div>
  );
};

export default QuestionnaireToast;
