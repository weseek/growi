import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';


type Props = {
}

export const ClickJapaneseTextLintRuleSettingsHandler: FC<Props> = () => {
  return (
    <></>
  );
};

export const ClickCommonTextLintRulesSettingsHandler: FC<Props> = () => {
  return (
    <></>
  );
};


export const EditorSettings: FC<Props> = () => {
  // TODO: apply i18n by GW-7244
  const { t } = useTranslation();

  return (
    <>
      <h2 className="border-bottom my-4">Common Settings</h2>

      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="common-misspellings"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="common-misspellings">
              <strong>common-misspellings</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules to find common misspellings from Wikipedia: Lists of common misspellings.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="max-comma"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="max-comma">
              <strong>max-comma</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rule is that limit maximum ten(、) count of sentence. <br />
              Default: 4
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="sentence-length"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="sentence-length">
              <strong>sentence-length</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules that limit Maximum Length of Sentence.
            </p>
          </div>

          <div className="row my-3">
            <div className="offset-4 col-5">
              <button type="button" className="btn btn-primary">
                {t('Update')}
              </button>
            </div>
          </div>

        </div>
      </div>


      <h2 className="border-bottom my-4">Japanese Settings</h2>

      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="ja-hiragana-keishikimeishi"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="ja-hiragana-keishikimeishi">
              <strong>ja-hiragana-keishikimeishi</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules to check easy-to-read Keishikimeishi(pronouns) written in Hiragana than Kanji.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="ja-no-abusage"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="ja-no-abusage">
              <strong>ja-no-abusage</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules to check for common misuse
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="ja-no-inappropriate-words"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="ja-no-inappropriate-words">
              <strong>ja-no-inappropriate-words</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules to check for inappropriate expressions
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="ja-no-mixed-period"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="ja-no-mixed-period">
              <strong>ja-no-mixed-period</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules to check that a paragraph always has a punctuation mark at the end
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="ja-no-redundant-expression"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="ja-no-redundant-expression">
              <strong>ja-no-redundant-expression</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules that prohibits redundant expressions.
              Redundant expressions are expressions that make sense even if they are omitted from the sentence.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="max-kanji-continuous-len"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="max-kanji-continuous-len">
              <strong>max-kanji-continuous-len</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules that limits the maximum number of consecutive Kanji.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="max-ten"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="max-ten">
              <strong>max-ten</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rule is that limit maximum ten(、) count of sentence.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="no-double-negative-ja"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="no-double-negative-ja">
              <strong>no-double-negative-ja</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules that detects double negation.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="no-doubled-conjunction"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="no-doubled-conjunction">
              <strong>no-doubled-conjunction</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules to check duplicated same conjunctions.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="no-doubled-joshi"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="no-doubled-joshi">
              <strong>no-doubled-joshi</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules that checks that the same particle appears consecutively in one sentence.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="no-dropping-the-ra"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="no-dropping-the-ra">
              <strong>no-dropping-the-ra</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules that detects the word dropping the ra.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="no-hankaku-kana"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="no-hankaku-kana">
              <strong>no-hankaku-kana</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules that disallow to use Half-width kana.
            </p>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="prefer-tari-tari"
              // checked={}
              // onChange={}
            />
            <label className="custom-control-label" htmlFor="prefer-tari-tari">
              <strong>prefer-tari-tari</strong>
            </label>
            <p className="form-text text-muted small">
              Textlint rules that checks tari tari.
            </p>
          </div>

          <div className="row my-3">
            <div className="offset-4 col-5">
              <button type="button" className="btn btn-primary">
                {t('Update')}
              </button>
            </div>
          </div>

        </div>
      </div>


    </>
  );
};
