import { useCallback, type JSX } from 'react';

import type { LinkProps } from 'next/link';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import { NextLink } from '~/components/ReactMarkdownComponents/NextLink';

import { useAiAssistantChatSidebar } from '../../../stores/ai-assistant';

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

const NextLinkWrapper = (props: LinkProps & {children: string, href: string}): JSX.Element => {
  const { close: closeAiAssistantChatSidebar } = useAiAssistantChatSidebar();

  const onClick = useCallback(() => {
    closeAiAssistantChatSidebar();
  }, [closeAiAssistantChatSidebar]);

  return (
    <NextLink href={props.href} onClick={onClick} className="link-primary">
      {props.children}
    </NextLink>
  );
};
const AssistantMessageCard = ({ children }: { children: string }): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={`card border-0 ${moduleClass} ${assistantMessageCardModuleClass}`}>
      <div className="card-body d-flex">
        <div className="me-2 me-lg-3">
          <span className="growi-custom-icons grw-ai-icon rounded-pill">growi_ai</span>
        </div>
        <div>
          { children.length > 0
            ? (
              <ReactMarkdown components={{ a: NextLinkWrapper }}>{children}</ReactMarkdown>
            )
            : (
              <span className="text-thinking">
                {t('sidebar_aichat.progress_label')} <span className="material-symbols-outlined">more_horiz</span>
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
