import React, { FC, useState } from 'react';
import PageDeleteOneModal from './PageDeleteOneModal';
import AppContainer from '../../client/services/AppContainer';

type Props = {
  path: string
  pageId: string
  revisionId: string
  appContainer: AppContainer,
}

const DeleteButton: FC <Props> = (props: Props) => {

  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-link p-0 text-decoration-none"
        value={props.path}
        onClick={() => {
          setIsShown(true);
        }}
      >
        <i className="icon-trash text-danger" />
      </button>
      <PageDeleteOneModal
        isOpen={isShown}
        onClose={() => setIsShown(false)}
        path={props.path}
        pageId={props.pageId}
        revisionId={props.revisionId}
        appContainer={props.appContainer}
      />
    </>
  );
};

export default DeleteButton;
