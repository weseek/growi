import { useCallback } from 'react';

import type { LinkProps } from 'next/link';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import { NextLink } from '~/components/ReactMarkdownComponents/NextLink';

import { useAiAssistantSidebar } from '../../../stores/ai-assistant';

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
  const { close: closeAiAssistantSidebar } = useAiAssistantSidebar();

  const onClick = useCallback(() => {
    closeAiAssistantSidebar();
  }, [closeAiAssistantSidebar]);

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
              <>
                <ReactMarkdown components={{ a: NextLinkWrapper }}>{children}</ReactMarkdown>
                <div className="d-flex mt-2 justify-content-start">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                  >
                    破棄
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                  >
                    採用
                  </button>
                </div>
              </>
            )
            : (
              <span className="text-thinking">
                {t('sidebar_ai_assistant.progress_label')} <span className="material-symbols-outlined">more_horiz</span>
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
