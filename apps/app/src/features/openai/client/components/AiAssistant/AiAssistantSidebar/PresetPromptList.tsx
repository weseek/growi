import { useTranslation } from 'react-i18next';

type Props = {
  //
}

const presetPrompts = [
  'sidebar_ai_assistant.preset_prompt.summarize',
  'sidebar_ai_assistant.preset_prompt.replace',
  'sidebar_ai_assistant.preset_prompt.correct',
  'sidebar_ai_assistant.preset_prompt.create',
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
            className="btn  text-body-secondary p-3 rounded-3 border border-1"
          >
            <div className="d-flex align-items-center">
              <span className="material-symbols-outlined fs-5 me-3">lightbulb</span>
              <span className="fs-6">{t(presetPrompt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
