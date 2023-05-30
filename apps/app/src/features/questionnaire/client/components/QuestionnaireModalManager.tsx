import { useCallback } from 'react';

import { useCurrentUser } from '~/stores/context';


import { StatusType } from '../../interfaces/questionnaire-answer-status';
import { IQuestionnaireOrderHasId } from '../../interfaces/questionnaire-order';
import { GuestQuestionnaireAnswerStatusService } from '../services/guest-questionnaire-answer-status';
import { useSWRxQuestionnaireOrders } from '../stores/questionnaire';

import QuestionnaireModal from './QuestionnaireModal';
import QuestionnaireToast from './QuestionnaireToast';

import styles from './QuestionnaireModalManager.module.scss';

const QuestionnaireModalManager = ():JSX.Element => {
  const { data: questionnaireOrders } = useSWRxQuestionnaireOrders();
  const { data: currentUser } = useCurrentUser();

  const questionnaireOrdersToShow = useCallback((questionnaireOrders: IQuestionnaireOrderHasId[] | undefined) => {
    const guestQuestionnaireAnswerStorage = GuestQuestionnaireAnswerStatusService.getStorage();
    if (currentUser != null || guestQuestionnaireAnswerStorage == null) {
      return questionnaireOrders;
    }

    return questionnaireOrders?.filter((questionnaireOrder) => {
      const localAnswerStatus = guestQuestionnaireAnswerStorage[questionnaireOrder._id];
      return localAnswerStatus == null || localAnswerStatus.status === StatusType.not_answered;
    });
  }, [currentUser]);

  return <>
    {questionnaireOrders?.map((questionnaireOrder) => {
      return <QuestionnaireModal
        questionnaireOrder={questionnaireOrder}
        key={questionnaireOrder._id} />;
    })}
    <div className={styles['grw-questionnaire-toasts']}>
      {questionnaireOrdersToShow(questionnaireOrders)?.map((questionnaireOrder) => {
        return <QuestionnaireToast questionnaireOrder={questionnaireOrder} key={questionnaireOrder._id}/>;
      })}
    </div>
  </>;
};

export default QuestionnaireModalManager;
