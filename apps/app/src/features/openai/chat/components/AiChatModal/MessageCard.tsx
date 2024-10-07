import ReactMarkdown from 'react-markdown';

import styles from './MessageCard.module.scss';

const moduleClass = styles['message-card'] ?? '';


const userMessageCardModuleClass = styles['user-message-card'] ?? '';

const UserMessageCard = ({ children }: { children?: string }): JSX.Element => (
  <div className={`card d-inline-flex align-self-end bg-success-subtle bg-info-subtle ${moduleClass} ${userMessageCardModuleClass}`}>
    <div className="card-body">
      { children != null && children.length > 0 && (
        <ReactMarkdown>{children}</ReactMarkdown>
      ) }
    </div>
  </div>
);


const assistantMessageCardModuleClass = styles['assistant-message-card'] ?? '';

const AssistantMessageCard = ({ children }: { children?: string }): JSX.Element => (
  <div className={`card d-inline-flex align-self-start border-0 ${moduleClass} ${assistantMessageCardModuleClass}`}>
    <div className="card-body">
      { children != null && children.length > 0 && (
        <ReactMarkdown>{children}</ReactMarkdown>
      ) }
    </div>
  </div>
);

type Props = {
  role: 'user' | 'assistant',
  children?: string,
}

export const MessageCard = (props: Props): JSX.Element => {
  const { role, children } = props;

  return role === 'user'
    ? <UserMessageCard>{children}</UserMessageCard>
    : <AssistantMessageCard>{children}</AssistantMessageCard>;
};
