import ReactMarkdown from 'react-markdown';

type Props = {
  children?: string,
  right?: boolean,
}

export const MessageCard = (props: Props): JSX.Element => {
  const { children, right } = props;

  const alignClass = right ? 'align-self-end bg-success-subtle' : 'align-self-start';
  const bgClass = right ? 'bg-info-subtle' : '';

  return (
    <div className={`card d-inline-flex ${alignClass} ${bgClass}`} style={{ maxWidth: '75%' }}>
      <div className="card-body">
        { children != null && children.length > 0 && (
          <ReactMarkdown>{children}</ReactMarkdown>
        ) }
      </div>
    </div>
  );
};
