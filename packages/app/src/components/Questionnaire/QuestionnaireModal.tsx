import { useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { IQuestionnaireOrderHasId } from '~/interfaces/questionnaire/questionnaire-order';
import { useCurrentUser } from '~/stores/context';
import { useQuestionnaireModal } from '~/stores/modal';


import Question from './Question';

type QuestionnaireModalProps = {
  questionnaireOrder: IQuestionnaireOrderHasId
}

const QuestionnaireModal = ({ questionnaireOrder }: QuestionnaireModalProps): JSX.Element => {
  const { data: currentUser } = useCurrentUser();

  const { data: questionnaireModalData, close: closeQuestionnaireModal } = useQuestionnaireModal();
  const isOpened = questionnaireModalData?.[questionnaireOrder._id];

  const [answered, setAnswered] = useState(false);

  const { t } = useTranslation();

  return (<Modal
    size="lg"
    isOpen={isOpened}
    toggle={() => closeQuestionnaireModal(questionnaireOrder._id)}
  >
    <ModalHeader
      tag="h4"
      toggle={() => closeQuestionnaireModal(questionnaireOrder._id)}
      className="bg-primary text-light">
      {answered
        ? <span className="mr-auto">{t('questionnaire.thank_you_for_answering')}</span>
        : <span>{t('questionnaire.give_us_feedback')}</span>
      }
    </ModalHeader>
    <ModalBody className="my-4">
      {answered
        ? <>{t('questionnaire.additional_feedback')}</>
        : <div className="container">
          <h3 className="grw-modal-head">{questionnaireOrder.title}</h3>
          <div className="row mt-4">
            <div className="col-6"></div>
            <div className="col-1 p-0 font-weight-bold text-center">{t('questionnaire.no_answer')}</div>
            <div className="col-5 d-flex justify-content-between">
              <span className="font-weight-bold">{t('questionnaire.disagree')}</span>
              <span className="font-weight-bold">{t('questionnaire.agree')}</span>
            </div>
          </div>
          {questionnaireOrder.questions?.map((question) => {
            return <Question question={question} key={question._id.toString()}/>;
          })}
        </div>
      }
    </ModalBody>
    <ModalFooter>
      {currentUser?.admin ? <a href="" className="mr-auto">{t('questionnaire.settings')}</a> : <></>}
      {answered
        ? <button type="button" className="btn btn-primary" onClick={() => closeQuestionnaireModal(questionnaireOrder._id)}>{t('Close')}</button>
        : <>
          <button type="button" className="btn btn-outline-secondary mr-3">{t('questionnaire.dont_show_again')}</button>
          <button type="button" className="btn btn-primary" onClick={() => setAnswered(true)}>{t('questionnaire.answer')}</button>
        </>}
    </ModalFooter>
  </Modal>);
};

export default QuestionnaireModal;
