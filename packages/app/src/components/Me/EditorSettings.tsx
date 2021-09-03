import React, {
  FC, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '~/client/services/AppContainer';

import EditorContainer from '~/client/services/EditorContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import { toastSuccess, toastError } from '~/client/util/apiNotification';

type Props = {
  appContainer: AppContainer,
}

const commonRulesMenuItems = [
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

const japaneseRulesMenuItems = [
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

type LintRules = {
  name: string;
  options?: unknown;
  isEnabled?: boolean;
}


const EditorSettingsBody: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { appContainer } = props;
  const [commonTextlintRules, setCommonTextlintRules] = useState<LintRules[]>([]);
  const [japaneseTextlintRules, setJapaneseTextlintRules] = useState<LintRules[]>([]);

  const initializeEditorSettings = async() => {
    const { data } = await appContainer.apiv3Get('/personal-setting/editor-settings');

    if (data?.commonTextlintRules != null) {
      setCommonTextlintRules(data?.commonTextlintRules);
    }
    if (data?.japaneseTextlintRules != null) {
      setJapaneseTextlintRules(data?.japaneseTextlintRules);
    }

    // If database is empty, add default rules to state
    if (data?.commonTextlintRules.length === 0 || data?.commonTextlintRules == null) {
      const defaultCommonRules = commonRulesMenuItems.map(rule => (
        {
          name: rule.name,
          isEnabled: true,
        }
      ));
      setCommonTextlintRules(defaultCommonRules);
    }
    if (data?.japaneseTextlintRules.length === 0 || data?.japaneseTextlintRules == null) {
      const defaultJapaneseRules = japaneseRulesMenuItems.map(rule => (
        {
          name: rule.name,
          isEnabled: true,
        }
      ));
      setJapaneseTextlintRules(defaultJapaneseRules);
    }
  };

  useEffect(() => {
    initializeEditorSettings();
  }, []);

  const commonRuleCheckboxHandler = (isChecked: boolean, ruleName: string) => {
    setCommonTextlintRules(prevState => (
      prevState.filter(rule => rule.name !== ruleName).concat({ name: ruleName, isEnabled: isChecked })
    ));
  };

  const japaneseRuleCheckboxHandler = (isChecked: boolean, ruleName: string) => {
    setJapaneseTextlintRules(prevState => (
      prevState.filter(rule => rule.name !== ruleName).concat({ name: ruleName, isEnabled: isChecked })
    ));
  };

  const updateCommonRuleHandler = async() => {
    try {
      const { data } = await appContainer.apiv3Put('/personal-setting/editor-settings', { commonTextlintRules });
      setCommonTextlintRules(data?.commonTextlintRules);
      toastSuccess(t('toaster.update_successed', { target: 'Updated Textlint Settings' }));
    }
    catch (err) {
      toastError(err);
    }
  };

  const updateJapaneseRuleHandler = async() => {
    try {
      const { data } = await appContainer.apiv3Put('/personal-setting/editor-settings', { japaneseTextlintRules });
      setJapaneseTextlintRules(data?.japaneseTextlintRules);
      toastSuccess(t('toaster.update_successed', { target: 'Updated Textlint Settings' }));
    }
    catch (err) {
      toastError(err);
    }
  };

  const isCheckedInCommonRules = (ruleName: string) => (
    commonTextlintRules.filter(stateRule => (
      stateRule.name === ruleName
    ))[0]?.isEnabled
  );

  const isCheckedInJapaneseRules = (ruleName: string) => (
    japaneseTextlintRules.filter(stateRule => (
      stateRule.name === ruleName
    ))[0]?.isEnabled
  );

  return (
    <>
      <h2 className="border-bottom my-4">{t('editor_settings.common_settings.common_settings')}</h2>
      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          {commonRulesMenuItems.map(rule => (
            <div
              key={rule.name}
              className="custom-control custom-switch custom-checkbox-success"
            >
              <input
                type="checkbox"
                className="custom-control-input"
                id={rule.name}
                checked={isCheckedInCommonRules(rule.name)}
                onChange={e => commonRuleCheckboxHandler(e.target.checked, rule.name)}
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
          {japaneseRulesMenuItems.map(rule => (
            <div
              key={rule.name}
              className="custom-control custom-switch custom-checkbox-success"
            >
              <input
                type="checkbox"
                className="custom-control-input"
                id={rule.name}
                checked={isCheckedInJapaneseRules(rule.name)}
                onChange={e => japaneseRuleCheckboxHandler(e.target.checked, rule.name)}
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

EditorSettingsBody.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};
