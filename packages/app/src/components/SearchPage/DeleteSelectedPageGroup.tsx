import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';

export const NONE_CHECKED = 'NONE_CHECKED';
export const INDETERMINATE = 'INDETERMINATE';
export const ALL_CHECKED = 'ALL_CHECKED';

const logger = loggerFactory('growi:searchResultList');

type Props = {
  isChecked: boolean,
  checkboxState: string,
  onClickInvoked?: () => void,
  onCheckInvoked?: (string) => void,
}

const DeleteAllButton:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    isChecked, checkboxState, onClickInvoked, onCheckInvoked,
  } = props;

  const changeCheckboxStateHandler = () => {
    console.log(`changeCheckboxStateHandler is called. current changebox state is ${checkboxState}`);
    // Todo: determine next checkboxState from one of the following and tell the parent component
    // to change the checkboxState by passing onCheckInvoked function the next checkboxState
    // - 'NONE_CHECKED'
    // - 'INDETERMINATE'
    // - 'ALL_CHECKED'
    // https://estoc.weseek.co.jp/redmine/issues/77525
    try {
      if (onCheckInvoked == null) { throw new Error('onCheckInvoked is null') }
      onCheckInvoked('');
    }
    catch (error) {
      logger.error(error);
    }
  };


  return (
    <>
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="custom-control custom-checkbox"
        onChange={changeCheckboxStateHandler}
        checked={isChecked}
      />
      <button
        type="button"
        className="text-danger font-weight-light"
        onClick={() => {
          try {
            if (onClickInvoked == null) { throw new Error('onClickInvoked is null') }
            onClickInvoked();
          }
          catch (error) {
            logger.error(error);
          }
        }}
      >
        <i className="icon-trash ml-3"></i>
        {t('search_result.delete_all_selected_page')}
      </button>
    </>
  );

};

DeleteAllButton.propTypes = {
};
export default DeleteAllButton;
