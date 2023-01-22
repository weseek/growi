import { useSWRxQuestionnaireOrders } from '~/stores/questionnaire';

import QuestionnaireModal from './QuestionnaireModal';
import QuestionnaireToast from './QuestionnaireToast';

import styles from './QuestionnaireModalManager.module.scss';

type QuestionnaireModalManagerProps = {
  growiQuestionnaireServerOrigin: string;
}

const QuestionnaireModalManager = ({ growiQuestionnaireServerOrigin }: QuestionnaireModalManagerProps):JSX.Element => {
  const { data: questionnaireOrders } = useSWRxQuestionnaireOrders();

  return <>
    {questionnaireOrders?.map((questionnaireOrder) => {
      return <QuestionnaireModal
        questionnaireOrder={questionnaireOrder}
        growiQuestionnaireServerOrigin = {growiQuestionnaireServerOrigin}
        key={questionnaireOrder._id} />;
    })}
    <div className={styles['grw-questionnaire-toasts']}>
      {questionnaireOrders?.map((questionnaireOrder) => {
        return <QuestionnaireToast questionnaireOrder={questionnaireOrder} key={questionnaireOrder._id}/>;
      })}
    </div>
  </>;
};

export default QuestionnaireModalManager;
