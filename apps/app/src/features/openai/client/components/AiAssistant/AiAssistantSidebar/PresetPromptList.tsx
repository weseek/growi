import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

type Props = {
  //
}

const presetPrompts = [
  'summarize',
  'correct',
];

export const PresetPromptList: React.FC<Props> = () => {
  const { t } = useTranslation();

  return (
    <div className="container py-4">
      <div className="d-flex flex-column gap-3">
        {presetPrompts.map(presetPrompt => (
          <button
            type="button"
            key={presetPrompt}
            className="btn text-body-secondary p-3 rounded-3 border border-1"
          >
            <div className="d-flex align-items-center">
              <span className="material-symbols-outlined fs-5 me-3">lightbulb</span>
              <span className="fs-6">{t(`sidebar_ai_assistant.preset_prompt.${presetPrompt}.title`)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
