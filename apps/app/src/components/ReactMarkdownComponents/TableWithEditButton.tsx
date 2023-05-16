import React, { useCallback } from 'react';

import EventEmitter from 'events';

import { Element } from 'react-markdown/lib/rehype-filter';

import {
  useIsGuestUser, useIsReadOnlyUser, useIsSharedUser, useShareLinkId,
} from '~/stores/context';

import styles from './TableWithEditButton.module.scss';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

type TableWithEditButtonProps = {
  children: React.ReactNode,
  node: Element,
  className?: string
}

export const TableWithEditButton = React.memo((props: TableWithEditButtonProps): JSX.Element => {

  const { children, node, className } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: shareLinkId } = useShareLinkId();

  const bol = node.position?.start.line;
  const eol = node.position?.end.line;

  const editButtonClickHandler = useCallback(() => {
    globalEmitter.emit('launchHandsonTableModal', bol, eol);
  }, [bol, eol]);

  const showEditButton = !isGuestUser && !isReadOnlyUser && !isSharedUser && shareLinkId == null;

  return (
    <div className={`editable-with-handsontable ${styles['editable-with-handsontable']}`}>
      { showEditButton && (
        <button className="handsontable-modal-trigger" onClick={editButtonClickHandler}>
          <i className="icon-note"></i>
        </button>
      )}
      <table className={className}>
        {children}
      </table>
    </div>
  );
});
TableWithEditButton.displayName = 'TableWithEditButton';
