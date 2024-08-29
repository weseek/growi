import ReactMarkdown from 'react-markdown';

type Props = {
  children?: string,
  right?: boolean,
}

export const MessageCard = (props: Props): JSX.Element => {
  const { children, right } = props;

  return (
    <div className={`card d-inline-flex ${right ? 'align-self-end' : 'align-self-start'}`} style={{ maxWidth: '75%' }}>
      <div className="card-body">
        { children != null && children.length > 0 && (
          <ReactMarkdown>{children}</ReactMarkdown>
        ) }
      </div>
    </div>
  );
};
