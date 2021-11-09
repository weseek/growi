import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';
import { CheckboxType } from '../../interfaces/search';

const logger = loggerFactory('growi:searchResultList');

type Props = {
  checkboxState: CheckboxType,
  onClickInvoked?: () => void,
  onCheckInvoked?: (nextCheckboxState:string) => void,
}

const DeleteSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    checkboxState, onClickInvoked, onCheckInvoked,
  } = props;

  const changeCheckboxStateHandler = () => {
    let nextCheckboxState!: string;
    switch (checkboxState) {
      case CheckboxType.ALL_CHECKED:
        nextCheckboxState = CheckboxType.NONE_CHECKED;
        break;
      case CheckboxType.INDETERMINATE || CheckboxType.NONE_CHECKED:
        nextCheckboxState = CheckboxType.ALL_CHECKED;
        break;
    }

    if (onCheckInvoked == null) { logger.error('onCheckInvoked is null') }
    else { onCheckInvoked(nextCheckboxState) }
  };


  return (
    <>
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="custom-control custom-checkbox ml-1"
        onChange={changeCheckboxStateHandler}
        checked={checkboxState !== CheckboxType.NONE_CHECKED}
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

DeleteSelectedPageGroup.propTypes = {
};
export default DeleteSelectedPageGroup;
