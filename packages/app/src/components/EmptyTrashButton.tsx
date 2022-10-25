import React from 'react';

import { useTranslation } from 'next-i18next';

type EmptyTrashButtonProps = {
  emptyTrashClickHandler: () => void,
  disableEmptyButton: boolean
};


const EmptyTrashButton = (props: EmptyTrashButtonProps): JSX.Element => {
  const { emptyTrashClickHandler, disableEmptyButton } = props;
  const { t } = useTranslation();

  return (
    <div className="d-flex align-items-center">
      <button
        type="button"
        className="btn btn-outline-secondary rounded-pill text-danger d-flex align-items-center"
        disabled={disableEmptyButton}
        onClick={() => emptyTrashClickHandler()}
      >
        <i className="icon-fw icon-trash"></i>
        <div>{t('modal_empty.empty_the_trash')}</div>
      </button>
    </div>
  );
};

export default EmptyTrashButton;
