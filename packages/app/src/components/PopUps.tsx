import { useSWRxQuestionnaireOrders } from '~/stores/questionnaire';

import QuestionnaireToast from './Questionnaire/QuestionnaireToast';

import styles from './PopUps.module.scss';

const PopUps = (): JSX.Element => {
  const { data: questionnaireOrders } = useSWRxQuestionnaireOrders();

  return <div className={styles['grw-popups']}>
    {questionnaireOrders?.map((questionnaireOrder) => {
      return <QuestionnaireToast questionnaireOrder={questionnaireOrder} key={questionnaireOrder._id}/>;
    })}
  </div>;
};

export default PopUps;
