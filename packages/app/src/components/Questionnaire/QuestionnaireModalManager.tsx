import { useSWRxQuestionnaireOrders } from '~/stores/questionnaire';

import QuestionnaireModal from './QuestionnaireModal';
import QuestionnaireToast from './QuestionnaireToast';

import styles from './QuestionnaireModalManager.module.scss';

const QuestionnaireModalManager = ():JSX.Element => {
  // const { data: questionnaireOrders } = useSWRxQuestionnaireOrders();
  const questionnaireOrders = [{
    _id: '169321977921537921',
    title: {
      ja_JP: 'タイトル',
      en_US: 'TITLE',
    },
    showFrom: new Date(),
    showUntil: new Date(),
    questions: [{
      _id: '169321973r7921537921',
      type: 'text',
      text: {
        ja_JP: 'GROWI どうすか？',
        en_US: 'Hows GROWI',
      },
    }],
    condition: {
      user: {
        types: ['admin', 'general'],
      },
      growi: {
        types: ['oss'], // GROWI types to show questionnaire in
        versionRegExps: ['adwwadwad'], // GROWI versions to show questionnaire in
      },
    },
  }];

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
