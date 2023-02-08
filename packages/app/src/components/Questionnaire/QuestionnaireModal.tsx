import { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { Modal, ModalBody } from 'reactstrap';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { IAnswer } from '~/interfaces/questionnaire/answer';
import { IQuestionnaireOrderHasId } from '~/interfaces/questionnaire/questionnaire-order';
import { useCurrentUser } from '~/stores/context';
import { useQuestionnaireModal } from '~/stores/modal';
import loggerFactory from '~/utils/logger';

import Question from './Question';

const logger = loggerFactory('growi:QuestionnaireModal');

type QuestionnaireModalProps = {
  questionnaireOrder: IQuestionnaireOrderHasId
}

const QuestionnaireModal = ({ questionnaireOrder }: QuestionnaireModalProps): JSX.Element => {
  const { data: currentUser } = useCurrentUser();
  const lang = currentUser?.lang;

  const { data: questionnaireModalData, close: closeQuestionnaireModal } = useQuestionnaireModal();
  const isOpened = questionnaireModalData?.openedQuestionnaireId === questionnaireOrder._id;

  const inputNamePrefix = 'question-';

  const { t } = useTranslation();

  const sendAnswer = useCallback(async(answers: IAnswer[]) => {
    try {
      await apiv3Put('/questionnaire/answer', {
        questionnaireOrderId: questionnaireOrder._id,
        answers,
      });
      toastSuccess(
        <>
          <div className="font-weight-bold">{t('questionnaire.thank_you_for_answering')}</div>
          <div className="pt-2">{t('questionnaire.additional_feedback')}</div>
        </>,
        {
          autoClose: 3000,
          closeButton: true,
        },
      );
    }
    catch (e) {
      logger.error(e);
      toastError(t('questionnaire.failed_to_send'));
    }
  }, [questionnaireOrder._id, t]);

  const submitHandler = useCallback(async(event) => {
    event.preventDefault();

    const answers: IAnswer[] = questionnaireOrder.questions.map((question) => {
      const answerValue = event.target[`${inputNamePrefix + question._id}`].value;
      return { question: question._id, value: answerValue };
    });

    sendAnswer(answers);

    const shouldCloseToastor = true;
    closeQuestionnaireModal(shouldCloseToastor);
  }, [closeQuestionnaireModal, questionnaireOrder.questions, sendAnswer]);

  const denyBtnClickHandler = useCallback(async() => {
    try {
      apiv3Put('/questionnaire/deny', {
        questionnaireOrderId: questionnaireOrder._id,
      });
      toastSuccess(t('questionnaire.denied'));
    }
    catch (e) {
      logger.error(e);
    }
    const shouldCloseToastor = true;
    closeQuestionnaireModal(shouldCloseToastor);
  }, [closeQuestionnaireModal, questionnaireOrder._id, t]);

  // No showing toasts since not important
  const closeBtnClickHandler = useCallback(async(shouldCloseToastor: boolean) => {
    closeQuestionnaireModal(shouldCloseToastor);

    try {
      await apiv3Put('/questionnaire/skip', {
        questionnaireOrderId: questionnaireOrder._id,
      });
    }
    catch (e) {
      logger.error(e);
    }
  }, [closeQuestionnaireModal, questionnaireOrder._id]);

  const closeBtnClickHandlerClosingToastor = useCallback(async() => {
    closeBtnClickHandler(true);
  }, [closeBtnClickHandler]);

  const questionnaireOrderTitle = lang === 'en_US' ? questionnaireOrder.title.en_US : questionnaireOrder.title.ja_JP;

  return (<Modal
    size="lg"
    isOpen={isOpened}
    toggle={closeBtnClickHandlerClosingToastor}
    centered
  >
    <form onSubmit={submitHandler}>
      <ModalBody className="bg-primary overflow-hidden p-0" style={{ borderRadius: 8 }}>
        <div className="bg-white m-2 p-4" style={{ borderRadius: 8 }}>
          <div className="text-center mb-2">
            <h2 className="my-4">{questionnaireOrderTitle}</h2>
            <p className="mb-1">{t('questionnaire.more_satisfied_services')}</p>
            <p>{t('questionnaire.strive_to_improve_services')}</p>
          </div>
          <div className="container">
            <div className="row mt-4">
              <div className="col-md-2 offset-md-5 font-weight-bold text-right align-items-center p-0">{t('questionnaire.no_answer')}</div>
              <div className="col-md-5 d-flex justify-content-between align-items-center">
                <span className="font-weight-bold">{t('questionnaire.disagree')}</span>
                <span className="font-weight-bold">{t('questionnaire.agree')}</span>
              </div>
            </div>
            {questionnaireOrder.questions?.map((question) => {
              return <Question question={question} inputNamePrefix={inputNamePrefix} key={question._id}/>;
            })}
          </div>
          <div className="text-center mt-5">
            <button type="submit" className="btn btn-primary">{t('questionnaire.answer')}</button>
          </div>
          <div className="text-center cursor-pointer text-decoration-underline my-3">
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={denyBtnClickHandler}>{t('questionnaire.dont_show_again')}</span>
          </div>

          {currentUser?.admin && (
            <a href="/admin/app#questionnaire-settings">
              <i className="material-icons mr-1" >admin_panel_settings</i>
            </a>
          )}
          {currentUser != null && (
            <a href="/me#other_settings">
              <i className="material-icons" >settings</i>
            </a>
          )}
        </div>
      </ModalBody>
    </form>
  </Modal>);
};

export default QuestionnaireModal;
