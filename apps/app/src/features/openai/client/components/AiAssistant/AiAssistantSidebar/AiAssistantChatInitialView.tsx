import { useTranslation } from 'react-i18next';

type Props = {
  description: string,
  pagePathPatterns: string[],
}

export const AiAssistantChatInitialView: React.FC<Props> = ({ description, pagePathPatterns }: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <p className="fs-6 text-body-secondary mb-0">
        {description}
      </p>

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
