import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { toastSuccess } from '~/client/util/toastr';
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

  const { t } = useTranslation();

  const answerBtnClickHandler = () => {
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
    closeQuestionnaireModal(questionnaireOrder._id);
  };

  return (<Modal
    size="lg"
    isOpen={isOpened}
    toggle={() => closeQuestionnaireModal(questionnaireOrder._id)}
  >
    <ModalHeader
      tag="h4"
      toggle={() => closeQuestionnaireModal(questionnaireOrder._id)}
      className="bg-primary text-light">
      <span>{t('questionnaire.give_us_feedback')}</span>
    </ModalHeader>
    <ModalBody className="my-4">
      <div className="container">
        <h3 className="grw-modal-head">{questionnaireOrder.title}</h3>
        <div className="row mt-4">
          <div className="col-6"></div>
          <div className="col-1 p-0 font-weight-bold text-center align-items-center">{t('questionnaire.no_answer')}</div>
          <div className="col-5 d-flex justify-content-between align-items-center">
            <span className="font-weight-bold">{t('questionnaire.disagree')}</span>
            <span className="font-weight-bold">{t('questionnaire.agree')}</span>
          </div>
        </div>
        {questionnaireOrder.questions?.map((question) => {
          return <Question question={question} key={question._id.toString()}/>;
        })}
      </div>
    </ModalBody>
    <ModalFooter>
      {currentUser?.admin
        && <a href="" className="mr-auto d-flex align-items-center"><i className="material-icons mr-1">settings</i>{t('questionnaire.settings')}</a>}
      <>
        <button type="button" className="btn btn-outline-secondary mr-3">{t('questionnaire.dont_show_again')}</button>
        <button type="button" className="btn btn-primary" onClick={answerBtnClickHandler}>{t('questionnaire.answer')}</button>
      </>
    </ModalFooter>
  </Modal>);
};

export default QuestionnaireModal;
