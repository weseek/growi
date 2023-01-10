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
      className="bg-primary text-light"
      cssModule={{ 'modal-title': 'modal-title flex-fill' }}>
      <div className="d-flex">
        {answered
          ? <span className="mr-auto">ご回答ありがとうございます</span>
          : <>
            <span className="mr-auto">{t('questionnaire.Questionnaire')}</span>
            <button type="button" className="btn btn-secondary mr-2">{t('questionnaire.don\'t show again')}</button>
            <button type="button" className="btn btn-secondary">{t('questionnaire.answer later')}</button>
          </>
        }
      </div>
    </ModalHeader>
    <ModalBody className="my-4">
      {answered
        ? <>その他ご意見ご要望は<a href="">こちら</a>からお願い致します。</>
        : <div className="container">
          <div className="row">
            <div className="col-5"> </div>
            <div className="col-7 d-flex justify-content-between">
              <span className="font-weight-bold">{t('questionnaire.strongly disagree')}</span>
              <span className="font-weight-bold">{t('questionnaire.strongly agree')}</span>
            </div>
          </div>
          {questions?.map((question) => {
            return <Question question={question} key={question._id.toString()} />;
          })}
        </div>
      }
    </ModalBody>
    <ModalFooter>
      {answered
        ? <button type="button" className="btn btn-primary" onClick={() => closeQuestionnaireModal()}>{t('Close')}</button>
        : <button type="button" className="btn btn-primary" onClick={() => setAnswered(true)}>{t('questionnaire.send answer')}</button>}
    </ModalFooter>
  </Modal>);
};

export default QuestionnaireModal;
