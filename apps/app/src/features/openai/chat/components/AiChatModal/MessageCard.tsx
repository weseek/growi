import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import styles from './MessageCard.module.scss';

const moduleClass = styles['message-card'] ?? '';


const userMessageCardModuleClass = styles['user-message-card'] ?? '';

const UserMessageCard = ({ children }: { children: string }): JSX.Element => (
  <div className={`card d-inline-flex align-self-end bg-success-subtle bg-info-subtle ${moduleClass} ${userMessageCardModuleClass}`}>
    <div className="card-body">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  </div>
);


const assistantMessageCardModuleClass = styles['assistant-message-card'] ?? '';

const AssistantMessageCard = ({ children }: { children: string }): JSX.Element => {

  const { t } = useTranslation();

  return (
    <div className={`card border-0 ${moduleClass} ${assistantMessageCardModuleClass}`}>
      <div className="card-body d-flex">
        <div className="me-2 me-lg-3">
          <span className="growi-custom-icons grw-ai-icon rounded-pill p-1">growi_ai</span>
        </div>

        <div className="mt-1">
          { children.length > 0
            ? (
              <ReactMarkdown>{children}</ReactMarkdown>
            )
            : (
              <span className="text-thinking">
                {t('modal_aichat.progress_label')} <span className="material-symbols-outlined">more_horiz</span>
              </span>
            )
          }
        </div>
      </div>
    </div>
  );
};

type Props = {
  role: 'user' | 'assistant',
  children: string,
}

export const MessageCard = (props: Props): JSX.Element => {
  const { role, children } = props;

  return role === 'user'
    ? <UserMessageCard>{children}</UserMessageCard>
    : <AssistantMessageCard>{children}</AssistantMessageCard>;
};
