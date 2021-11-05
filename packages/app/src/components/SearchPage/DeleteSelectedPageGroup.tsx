import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';
// import { CheckboxType } from '../../interfaces/search';

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
    // - NONE_CHECKED
    // - INDETERMINATE
    // - ALL_CHECKED
    // https://estoc.weseek.co.jp/redmine/issues/77525
    // use CheckboxType by importing from packages/app/src/interfaces/
    if (onCheckInvoked == null) { logger.error('onCheckInvoked is null') }
    else { onCheckInvoked('') }
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
          if (onClickInvoked == null) { logger.error('onClickInvoked is null') }
          else { onClickInvoked() }
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
