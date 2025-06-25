import { useTranslation } from 'react-i18next';

import { ThreadList } from './ThreadList';

type Props = {
  description: string,
  pagePathPatterns: string[],
}

export const AiAssistantChatInitialView: React.FC<Props> = ({ description, pagePathPatterns }: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      {description.length !== 0 && (
        <p className="fs-6 text-body-secondary mb-0">
          {description}
        </p>
      )}
      <div>
        <div className="mb-3">
          <p className="text-body-secondary mb-0">{t('sidebar_ai_assistant.reference_pages_label')}</p>
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

        <div className="mt-3">
          <p className="text-body-secondary mb-0">最近のチャット</p>
          <ThreadList />
        </div>

      </div>
    </>
  );
};
