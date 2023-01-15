import { useSWRxQuestionnaireOrders } from '~/stores/questionnaire';

import QuestionnaireModal from './QuestionnaireModal';

const QuestionnaireModalManager = ():JSX.Element => {
  const { data: questionnaireOrders } = useSWRxQuestionnaireOrders();

  return <>
    {questionnaireOrders?.map((questionnaireOrder) => {
      return <QuestionnaireModal questionnaireOrder={questionnaireOrder} key={questionnaireOrder._id} />;
    })}
  </>;
};

export default QuestionnaireModalManager;
