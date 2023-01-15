import { useSWRxQuestionnaireOrders } from '~/stores/questionnaire';

import QuestionnaireToast from './Questionnaire/QuestionnaireToast';

const PopUps = (): JSX.Element => {
  const { data: questionnaireOrders } = useSWRxQuestionnaireOrders();

  return <div style={{
    position: 'fixed', bottom: 20, right: 20, width: 280,
  }}>
    {questionnaireOrders?.map((questionnaireOrder) => {
      return <QuestionnaireToast questionnaireOrder={questionnaireOrder} key={questionnaireOrder._id}/>;
    })}
  </div>;
};

export default PopUps;
