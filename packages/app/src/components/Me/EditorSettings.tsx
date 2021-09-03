import React, {
  FC, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';
import { toastSuccess, toastError } from '~/client/util/apiNotification';


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

type Props = {
  appContainer: AppContainer,
}

const EditorSettingsBody: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { appContainer } = props;
  const [textlintRules, setTextlintRules] = useState<LintRules[]>([]);

  const initializeEditorSettings = async() => {
    const { data } = await appContainer.apiv3Get('/personal-setting/editor-settings');

    if (data?.textlintSettings?.textlintRules != null) {
      setTextlintRules(data.textlintSettings.textlintRules);
    }

    // If database is empty, add default rules to state
    if (data?.textlintSettings?.textlintRules == null) {
      const defaultCommonRules = commonRulesMenuItems.map(rule => (
        {
          name: rule.name,
          isEnabled: true,
        }
      ));

      const defaultJapaneseRules = japaneseRulesMenuItems.map(rule => (
        {
          name: rule.name,
          isEnabled: true,
        }
      ));

      setTextlintRules([...defaultCommonRules, ...defaultJapaneseRules]);
    }
  };

  useEffect(() => {
    initializeEditorSettings();
  }, []);

  const ruleCheckboxHandler = (isChecked: boolean, ruleName: string) => {
    setTextlintRules(prevState => (
      prevState.filter(rule => rule.name !== ruleName).concat({ name: ruleName, isEnabled: isChecked })
    ));
  };

  const updateRulesHandler = async() => {
    try {
      const { data } = await appContainer.apiv3Put('/personal-setting/editor-settings', { textlintSettings: textlintRules });
      setTextlintRules(data.textlintSettings.textlintRules);
      toastSuccess(t('toaster.update_successed', { target: 'Updated Textlint Settings' }));
    }
    catch (err) {
      toastError(err);
    }
  };

  const isCheckedRule = (ruleName: string) => (
    textlintRules.filter(stateRule => (
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
                checked={isCheckedRule(rule.name)}
                onChange={e => ruleCheckboxHandler(e.target.checked, rule.name)}
              />
              <label className="custom-control-label" htmlFor={rule.name}>
                <strong>{rule.name}</strong>
              </label>
              <p className="form-text text-muted small">
                {t(rule.description)}
              </p>
            </div>
          ))}
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
                checked={isCheckedRule(rule.name)}
                onChange={e => ruleCheckboxHandler(e.target.checked, rule.name)}
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
                onClick={updateRulesHandler}
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

export const EditorSettings = withUnstatedContainers(EditorSettingsBody, [AppContainer]);

EditorSettingsBody.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};
