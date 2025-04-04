import { useTranslation } from 'react-i18next';

type Props = {
  description: string,
  additionalInstruction: string,
  pagePathPatterns: string[],
}

export const AiAssistantChatInitialView: React.FC<Props> = ({ description, additionalInstruction, pagePathPatterns }: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <p className="fs-6 text-body-secondary mb-0">
        {description}
      </p>

      <div>
        <p className="text-body-secondary">{t('sidebar_ai_assistant.instruction_label')}</p>
        <div className="card bg-body-tertiary border-0">
          <div className="card-body p-3">
            <p className="fs-6 text-body-secondary mb-0">
              {additionalInstruction}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="d-flex align-items-center">
          <p className="text-body-secondary mb-0">{t('sidebar_ai_assistant.reference_pages_label')}</p>
        </div>
        <div className="d-flex flex-column gap-1">
          { pagePathPatterns.map(pagePathPattern => (
            <a
              key={pagePathPattern}
              href="#"
              className="fs-6 text-body-secondary text-decoration-none"
            >
              {pagePathPattern}
            </a>
          ))}
        </div>
      </div>
    </>
  );
};
