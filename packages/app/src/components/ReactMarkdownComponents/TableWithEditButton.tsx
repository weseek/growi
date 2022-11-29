import React, { useCallback } from 'react';

import EventEmitter from 'events';

import { Element } from 'react-markdown/lib/rehype-filter';

import { useIsGuestUser, useIsSharedUser } from '~/stores/context';

import styles from './TableWithEditButton.module.scss';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

type TableWithEditButtonProps = {
  children: React.ReactNode,
  node: Element,
}


export const TableWithEditButton = React.memo((props: TableWithEditButtonProps): JSX.Element => {
  const { node, children } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();

  const bol = node.position?.start.line;
  const eol = node.position?.end.line;

  const editButtonClickHandler = useCallback(() => {
    globalEmitter.emit('launchHandsonTableModal', bol, eol);
  }, [bol, eol]);

  const showEditButton = !isGuestUser && !isSharedUser;

  return (
    <div className={`${styles.test}`}>
      <div className={`editable-with-handsontable ${styles['editable-with-handsontable']}`}>
        { showEditButton && (
          <button className="handsontable-modal-trigger" onClick={editButtonClickHandler}>
            <i className="icon-note"></i>
          </button>
        )}
        <table className="table table-bordered">
          {children}
        </table>
      </div>
    </div>
  );
});
TableWithEditButton.displayName = 'TableWithEditButton';
