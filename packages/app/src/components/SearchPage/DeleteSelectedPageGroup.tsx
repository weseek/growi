import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';
import { CheckboxType } from '../../interfaces/search';

const logger = loggerFactory('growi:searchResultList');

type Props = {
  checkboxState: CheckboxType,
  onClickInvoked?: () => void,
  onCheckInvoked?: (string:CheckboxType) => void,
}

const DeleteSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    checkboxState, onClickInvoked, onCheckInvoked,
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
    else { onCheckInvoked(CheckboxType.ALL_CHECKED) } // change this to an appropriate value
  };


  return (
    <>
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="custom-control custom-checkbox ml-1 align-self-center"
        onChange={changeCheckboxStateHandler}
        checked={checkboxState === CheckboxType.INDETERMINATE || checkboxState === CheckboxType.ALL_CHECKED}
      />
      <button
        type="button"
        className="btn text-danger font-weight-light p-0 ml-3"
        onClick={() => {
          if (onClickInvoked == null) { logger.error('onClickInvoked is null') }
          else { onClickInvoked() }
        }}
      >
        <i className="icon-trash"></i>
        {t('search_result.delete_all_selected_page')}
      </button>
    </>
  );

};

DeleteSelectedPageGroup.propTypes = {
};
export default DeleteSelectedPageGroup;
