import { useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useQuestionnaireModal } from '~/stores/modal';
import { useSWRxQuestionnaireOrders } from '~/stores/questionnaire';

import Question from './Question';

const QuestionnaireModal = (): JSX.Element => {
  const { data: questionnaireModalData, close: closeQuestionnaireModal } = useQuestionnaireModal();
  const isOpened = questionnaireModalData?.isOpened;

  const { data: questionnaireOrders } = useSWRxQuestionnaireOrders();

  const questions = questionnaireOrders?.flatMap(questionnaireOrder => questionnaireOrder.questions);

  const [answered, setAnswered] = useState(false);

  const { t } = useTranslation();

  return (<Modal
    size="lg"
    isOpen={isOpened}
    toggle={() => closeQuestionnaireModal()}
  >
    <ModalHeader
      tag="h4"
      toggle={() => closeQuestionnaireModal()}
      className="bg-primary text-light">
      {answered
        ? <span className="mr-auto">{t('questionnaire.thank you for answering')}</span>
        : <span>アンケートのタイトル</span>
      }
    </ModalHeader>
    <ModalBody className="my-4">
      {answered
        ? <>その他ご意見ご要望は<a href="">こちら</a>からお願い致します。</>
        : <div className="container">
          <h3 className="grw-modal-head">{t('questionnaire.Give us feedback for improvements')}</h3>
          <div className="row mt-4">
            <div className="col-6"></div>
            <div className="col-1 p-0 font-weight-bold text-center">{t('questionnaire.no answer')}</div>
            <div className="col-5 d-flex justify-content-between">
              <span className="font-weight-bold pl-3">{t('questionnaire.disagree')}</span>
              <span className="font-weight-bold pr-3">{t('questionnaire.agree')}</span>
            </div>
          </div>
          {questions?.map((question) => {
            return <Question question={question} key={question._id.toString()}/>;
          })}
        </div>
      }
    </ModalBody>
    <ModalFooter>
      {answered
        ? <button type="button" className="btn btn-primary" onClick={() => closeQuestionnaireModal()}>{t('Close')}</button>
        : <>
          <div className="form-check form-check-inline mr-4">
            <input className="form-check-input" type="checkbox"/>
            <label className="form-check-label">{t('questionnaire.don\'t show again')}</label>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setAnswered(true)}>{t('questionnaire.send answer')}</button>
        </>}
    </ModalFooter>
  </Modal>);
};

export default QuestionnaireModal;
