import React from 'react';

type TableProps = {
  children: React.ReactNode,
  className?: string
  'data-line': number
}

export const Table = React.memo((props: TableProps): JSX.Element => {

  const { children, className } = props;

  return (
    <table className={`${className}`} data-line={props['data-line']}>
      {children}
    </table>
  );
});
Table.displayName = 'Table';
