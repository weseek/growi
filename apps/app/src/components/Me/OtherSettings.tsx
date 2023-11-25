import { useTranslation } from 'next-i18next';

import { QuestionnaireSettings } from './QuestionnaireSettings';

const OtherSettings = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mt-4">
        <QuestionnaireSettings />
      </div>

      <h2 className="border-bottom my-4">UI設定</h2>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="form-check form-switch form-check-primary">
            <input type="checkbox" className="form-check-input" id="isQuestionnaireEnabled" onChange={() => {}} />
            <label className="form-label form-check-label" htmlFor="isQuestionnaireEnabled">
              ワイドビューを有効にする
            </label>
            <p className="form-text text-muted small">ワイドビューを有効にすると、ページ内コンテンツがページの横幅いっぱいに広がります</p>
          </div>
        </div>
      </div>

      <div className="row my-3">
        <div className="offset-4 col-5">
          <button data-testid="" type="button" className="btn btn-primary" onClick={() => {}}>
            {t('Update')}
          </button>
        </div>
      </div>
    </>
  );
};

export default OtherSettings;
