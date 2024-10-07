import ReactMarkdown from 'react-markdown';


const UserMessageCard = ({ children }: { children?: string }): JSX.Element => (
  <div className="card d-inline-flex align-self-end bg-success-subtle bg-info-subtle" style={{ maxWidth: '75%' }}>
    <div className="card-body">
      { children != null && children.length > 0 && (
        <ReactMarkdown>{children}</ReactMarkdown>
      ) }
    </div>
  </div>
);

const AssistantMessageCard = ({ children }: { children?: string }): JSX.Element => (
  <div className="card d-inline-flex align-self-start" style={{ maxWidth: '75%' }}>
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
