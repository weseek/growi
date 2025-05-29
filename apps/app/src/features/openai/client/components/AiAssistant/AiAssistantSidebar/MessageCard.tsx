import { useCallback, useState, type JSX } from 'react';

import { LoadingSpinner } from '@growi/ui/dist/components';
import type { LinkProps } from 'next/link';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import { NextLink } from '~/components/ReactMarkdownComponents/NextLink';

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
  return (
    <NextLink href={props.href} className="link-primary">
      {props.children}
    </NextLink>
  );
};

const AssistantMessageCard = ({
  children, isGeneratingEditorText, showActionButtons, onAccept, onDiscard,
}: {
  children: string,
  showActionButtons?: boolean
  isGeneratingEditorText?: boolean
  onAccept?: () => void,
  onDiscard?: () => void,
}): JSX.Element => {
  const { t } = useTranslation();

  const [isActionButtonClicked, setIsActionButtonClicked] = useState(false);

  const clickActionButtonHandler = useCallback((action: 'accept' | 'discard') => {
    setIsActionButtonClicked(true);
    if (action === 'accept') {
      onAccept?.();
      return;
    }

    onDiscard?.();
  }, [onAccept, onDiscard]);

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

                {isGeneratingEditorText && (
                  <div className="text-muted mb-3">
                    <LoadingSpinner />
                    <span className="ms-2">{t('sidebar_ai_assistant.text_generation_by_editor_assistant_label')}</span>
                  </div>
                )}

                {showActionButtons && !isActionButtonClicked && (
                  <div className="d-flex mt-2 justify-content-start">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => clickActionButtonHandler('discard')}
                    >
                      {t('sidebar_ai_assistant.discard')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => clickActionButtonHandler('accept')}
                    >
                      {t('sidebar_ai_assistant.accept')}
                    </button>
                  </div>
                )}
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

export type MessageCardRole = 'user' | 'assistant';

type Props = {
  role: MessageCardRole,
  children: string,
  showActionButtons?: boolean,
  isGeneratingEditorText?: boolean,
  onDiscard?: () => void,
  onAccept?: () => void,
}

export const MessageCard = (props: Props): JSX.Element => {
  const {
    role, children, showActionButtons, isGeneratingEditorText, onAccept, onDiscard,
  } = props;

  return role === 'user'
    ? <UserMessageCard>{children}</UserMessageCard>
    : (
      <AssistantMessageCard
        showActionButtons={showActionButtons}
        isGeneratingEditorText={isGeneratingEditorText}
        onAccept={onAccept}
        onDiscard={onDiscard}
      >{children}
      </AssistantMessageCard>
    );
};
