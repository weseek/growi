import React, {
  Dispatch,
  FC, SetStateAction, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';


type EditorSettingsBodyProps = Record<string, never>;

type RuleListGroupProps = {
  title: string;
  ruleList: RulesMenuItem[]
  textlintRules: LintRule[]
  setTextlintRules: Dispatch<SetStateAction<LintRule[]>>
}

type LintRule = {
  name: string
  options?: unknown
  isEnabled?: boolean
}

type RulesMenuItem = {
  name: string
  description: string
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
  // {  // omit because en-pos package is too big
  //   name: 'en-capitalization',
  //   description: 'editor_settings.common_settings.en_capitalization',
  // },
  {
    name: 'no-unmatched-pair',
    description: 'editor_settings.common_settings.no_unmatched_pair',
  },
  {
    name: 'date-weekday-mismatch',
    description: 'editor_settings.common_settings.date_weekday_mismatch',
  },
  {
    name: 'no-kangxi-radicals',
    description: 'editor_settings.common_settings.no_kangxi_radicals',
  },
  {
    name: 'no-surrogate-pair',
    description: 'editor_settings.common_settings.no_surrogate_pair',
  },
  {
    name: 'no-zero-width-spaces',
    description: 'editor_settings.common_settings.no_zero_width_spaces',
  },
  {
    name: 'period-in-list-item',
    description: 'editor_settings.common_settings.period_in_list_item',
  },
  {
    name: 'use-si-units',
    description: 'editor_settings.common_settings.use_si_units',
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
  {
    name: 'ja-unnatural-alphabet',
    description: 'editor_settings.japanese_settings.ja_unnatural_alphabet',
  },
  {
    name: 'no-mixed-zenkaku-and-hankaku-alphabet',
    description: 'editor_settings.japanese_settings.no_mixed_zenkaku_and_hankaku_alphabet',
  },
  {
    name: 'no-nfd',
    description: 'editor_settings.japanese_settings.no_nfd',
  },

];


const RuleListGroup: FC<RuleListGroupProps> = ({
  title, ruleList, textlintRules, setTextlintRules,
}: RuleListGroupProps) => {
  const { t } = useTranslation();

  const isCheckedRule = (ruleName: string) => (
    textlintRules.find(stateRule => (
      stateRule.name === ruleName
    ))?.isEnabled || false
  );

  const ruleCheckboxHandler = (isChecked: boolean, ruleName: string) => {
    setTextlintRules(prevState => (
      prevState.filter(rule => rule.name !== ruleName).concat({ name: ruleName, isEnabled: isChecked })
    ));
  };

  return (
    <>
      <h2 className="border-bottom my-4">{t(title)}</h2>
      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          {ruleList.map(rule => (
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
    </>
  );
};


export const EditorSettings: FC<EditorSettingsBodyProps> = () => {
  const { t } = useTranslation();
  const [textlintRules, setTextlintRules] = useState<LintRule[]>([]);

  const initializeEditorSettings = useCallback(async() => {
    const { data } = await apiv3Get('/personal-setting/editor-settings');
    const retrievedRules: LintRule[] = data?.textlintSettings?.textlintRules;

    // If database is empty, add default rules to state
    if (retrievedRules != null && retrievedRules.length > 0) {
      setTextlintRules(retrievedRules);
    }
    else {
      const createRulesFromDefaultList = (rule: { name: string }) => (
        {
          name: rule.name,
          isEnabled: true,
        }
      );

      const defaultCommonRules = commonRulesMenuItems.map(rule => createRulesFromDefaultList(rule));
      const defaultJapaneseRules = japaneseRulesMenuItems.map(rule => createRulesFromDefaultList(rule));
      setTextlintRules([...defaultCommonRules, ...defaultJapaneseRules]);
    }

  }, []);

  useEffect(() => {
    initializeEditorSettings();
  }, [initializeEditorSettings]);

  const updateRulesHandler = async() => {
    try {
      const { data } = await apiv3Put('/personal-setting/editor-settings', { textlintSettings: { textlintRules: [...textlintRules] } });
      setTextlintRules(data.textlintSettings.textlintRules);
      toastSuccess(t('toaster.update_successed', { target: 'Updated Textlint Settings' }));
    }
    catch (err) {
      toastError(err);
    }
  };

  if (textlintRules == null) {
    return <></>;
  }

  return (
    <div data-testid="grw-editor-settings">
      <RuleListGroup
        title="editor_settings.common_settings.common_settings"
        ruleList={commonRulesMenuItems}
        textlintRules={textlintRules}
        setTextlintRules={setTextlintRules}
      />
      <RuleListGroup
        title="editor_settings.japanese_settings.japanese_settings"
        ruleList={japaneseRulesMenuItems}
        textlintRules={textlintRules}
        setTextlintRules={setTextlintRules}
      />

      <div className="row my-3">
        <div className="offset-4 col-5">
          <button
            data-testid="grw-editor-settings-update-button"
            type="button"
            className="btn btn-primary"
            onClick={updateRulesHandler}
          >
            {t('Update')}
          </button>
        </div>
      </div>
    </div>
  );
};
