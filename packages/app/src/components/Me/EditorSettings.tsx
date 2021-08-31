import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';


type Props = {
}

export const JapaneseTextLintRuleSettings: FC<Props> = () => {
  return (
    <></>
  );
};

export const WithoutJapaneseTextLintRulesSettings: FC<Props> = () => {
  return (
    <></>
  );
};


export const EditorSettings: FC<Props> = () => {
  const { t } = useTranslation();
  // TODO: apply i18n byGW-7244

  return (
    <>
      <h4 className="mt-4">Japanese Settings</h4>

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


      <h4 className="mt-4">Common Settings</h4>

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
