import type { ReactNode } from 'react';

type Props = {
  children?: ReactNode,
  right?: boolean,
}

export const MessageCard = (props: Props): JSX.Element => {
  const { children, right } = props;

  return (
    <div className={`card d-inline-flex ${right ? 'align-self-end' : 'align-self-start'}`} style={{ maxWidth: '75%' }}>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};
