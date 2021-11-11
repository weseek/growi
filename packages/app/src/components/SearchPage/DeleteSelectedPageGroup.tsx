import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';
import { CheckboxType } from '../../interfaces/search';

const logger = loggerFactory('growi:searchResultList');

type Props = {
  checkboxState: CheckboxType,
  onCheckInvoked?: () => void,
  onClickDeleteButton?: () => void,
}

const DeleteSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    checkboxState, onCheckInvoked, onClickDeleteButton,
  } = props;

  const onCheckAllPages = () => {
    if (onCheckInvoked == null) { logger.error('onCheckInvoked is null') }
    else { onCheckInvoked() }
  };

  const onClickDeleteButtonHandler = () => {
    if (onClickDeleteButton == null) { logger.error('onClickDeleteButton is null') }
    else { onClickDeleteButton() }
  };

  return (
    <>
      {/** todo: implement the design for CheckboxType = INDETERMINATE */}
      {/** refs: https://estoc.weseek.co.jp/redmine/issues/81246  */}
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="custom-control custom-checkbox ml-1 align-self-center"
        onClick={onCheckAllPages}
        checked={checkboxState !== CheckboxType.NONE_CHECKED}
      />
      <button
        type="button"
        className="btn text-danger font-weight-light p-0 ml-3"
        onClick={onClickDeleteButtonHandler}
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
