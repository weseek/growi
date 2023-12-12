import { QuestionnaireSettings } from './QuestionnaireSettings';
import { UISettings } from './UISettings';

const OtherSettings = (): JSX.Element => {

  return (
    <>
      <div className="mt-4">
        <QuestionnaireSettings />
      </div>

      <div className="mt-4">
        <UISettings />
      </div>
    </>
  );
};

export default OtherSettings;
