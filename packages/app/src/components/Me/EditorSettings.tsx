import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AppContainer from '~/client/services/AppContainer';

import EditorContainer from '~/client/services/EditorContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

// type Props = {
//   editorContainer: EditorContainer
// }

const commonTextlintRules = [
  {
    name: 'common-misspellings',
    description: 'editor_settings.common_settings.common_misspellings',
  },
  {
    name: 'max-comma',
    description: 'editor_settings.common_settings.max_comma',
  },
  {
    name: 'sentence-length',
    description: 'editor_settings.common_settings.sentence_length',
  },
];

const japaneseTextlintRules = [
  {
    name: 'ja-hiragana-keishikimeishi',
    description: 'editor_settings.japanese_settings.ja_hiragana_keishikimeishi',
  },
  {
    name: 'ja-no-abusage',
    description: 'editor_settings.japanese_settings.ja_no_abusage',
  },
  {
    name: 'ja-no-inappropriate-words',
    description: 'editor_settings.japanese_settings.ja_no_inappropriate_words',
  },
  {
    name: 'ja-no-mixed-period',
    description: 'editor_settings.japanese_settings.ja_no_mixed_period',
  },
  {
    name: 'ja-no-redundant-expression',
    description: 'editor_settings.japanese_settings.ja_no_redundant_expression',
  },
  {
    name: 'max-kanji-continuous-len',
    description: 'editor_settings.japanese_settings.max_kanji_continuous_len',
  },
  {
    name: 'max-ten',
    description: 'editor_settings.japanese_settings.max_ten',
  },
  {
    name: 'no-double-negative-ja',
    description: 'editor_settings.japanese_settings.no_double_negative_ja',
  },
  {
    name: 'no-doubled-conjunction',
    description: 'editor_settings.japanese_settings.no_doubled_conjunction',
  },
  {
    name: 'no-doubled-joshi',
    description: 'editor_settings.japanese_settings.no_doubled_joshi',
  },
  {
    name: 'no-dropping-the-ra',
    description: 'editor_settings.japanese_settings.no_dropping_the_ra',
  },
  {
    name: 'no-hankaku-kana',
    description: 'editor_settings.japanese_settings.no_hankaku_kana',
  },
  {
    name: 'prefer-tari-tari',
    description: 'editor_settings.japanese_settings.prefer_tari_tari',
  },

];

const EditorSettingsBody: FC = (props) => {
  // TODO: apply i18n by GW-7244
  const { t } = useTranslation();
  const { editorContainer } = props;
  const { retrieveEditorSettings, updateEditorSettings } = editorContainer;

  useEffect(() => {
    retrieveEditorSettings();
    console.log(editorContainer.isTextlintEnabled);
    console.log(editorContainer.commonTextlintRules);

    console.log(editorContainer.japaneseTextlintRules);
  }, [retrieveEditorSettings]);

  const commonRuleCheckboxHandler = async(ruleName) => {
    await updateEditorSettings(ruleName);
  };

  const japaneseRuleCheckboxHandler = async(ruleName) => {
    await updateEditorSettings(ruleName);
  };

  const updateCommonRuleHandler = async() => {
    try {
      await updateEditorSettings();
    }
    catch (err) {
      console.log(err);
    }
  };

  const updateJapaneseRuleHandler = async() => {
    try {
      await updateEditorSettings();
    }
    catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h2 className="border-bottom my-4">{t('editor_settings.common_settings.common_settings')}</h2>
      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          {commonTextlintRules.map(rule => (
            <div
              key={rule.name}
              className="custom-control custom-switch custom-checkbox-success"
            >
              <input
                type="checkbox"
                className="custom-control-input"
                id={rule.name}
                // checked={editorContainer.}
                onChange={() => commonRuleCheckboxHandler(rule.name)}
              />
              <label className="custom-control-label" htmlFor={rule.name}>
                <strong>{rule.name}</strong>
              </label>
              <p className="form-text text-muted small">
                {t(rule.description)}
              </p>
            </div>
          ))}

          <div className="row my-3">
            <div className="offset-4 col-5">
              <button
                type="button"
                className="btn btn-primary"
                onClick={updateCommonRuleHandler}
              >
                {t('Update')}
              </button>
            </div>
          </div>

        </div>
      </div>


      <h2 className="border-bottom my-4">{t('editor_settings.japanese_settings.japanese_settings')}</h2>

      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          {japaneseTextlintRules.map(rule => (
            <div
              key={rule.name}
              className="custom-control custom-switch custom-checkbox-success"
            >
              <input
                type="checkbox"
                className="custom-control-input"
                id={rule.name}
                // checked={}
                onChange={() => japaneseRuleCheckboxHandler(rule.name)}
              />
              <label className="custom-control-label" htmlFor={rule.name}>
                <strong>{rule.name}</strong>
              </label>
              <p className="form-text text-muted small">
                {t(rule.description)}
              </p>
            </div>
          ))}
          <div className="row my-3">
            <div className="offset-4 col-5">
              <button
                type="button"
                className="btn btn-primary"
                onClick={updateJapaneseRuleHandler}
              >
                {t('Update')}
              </button>
            </div>
          </div>

        </div>
      </div>


    </>
  );
};

export const EditorSettings = withUnstatedContainers(EditorSettingsBody, [AppContainer, EditorContainer]);
