import React from 'react';

type TableProps = {
  children: React.ReactNode,
  className?: string
}

export const Table = React.memo((props: TableProps): JSX.Element => {

  const { children, className } = props;

  return (
    <table className={className}>
      {children}
    </table>
  );
});
Table.displayName = 'Table';
