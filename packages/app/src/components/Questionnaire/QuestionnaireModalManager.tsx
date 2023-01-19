import { useSWRxQuestionnaireOrders } from '~/stores/questionnaire';

import QuestionnaireModal from './QuestionnaireModal';
import QuestionnaireToast from './QuestionnaireToast';

import styles from './QuestionnaireModalManager.module.scss';

const QuestionnaireModalManager = ():JSX.Element => {
  const { data: questionnaireOrders } = useSWRxQuestionnaireOrders();

  return <>
    {questionnaireOrders?.map((questionnaireOrder) => {
      return <QuestionnaireModal questionnaireOrder={questionnaireOrder} key={questionnaireOrder._id} />;
    })}
    <div className={styles['grw-questionnaire-toasts']}>
      {questionnaireOrders?.map((questionnaireOrder) => {
        return <QuestionnaireToast questionnaireOrder={questionnaireOrder} key={questionnaireOrder._id}/>;
      })}
    </div>
  </>;
};

export default QuestionnaireModalManager;
