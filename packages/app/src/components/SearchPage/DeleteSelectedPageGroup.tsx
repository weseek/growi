import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';
import { CheckboxType } from '../../interfaces/search';

const logger = loggerFactory('growi:searchResultList');

type Props = {
  checkboxState: CheckboxType,
  onClickDeleteButton?: () => void,
  onCheckInvoked?: () => void,
}

const DeleteSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    checkboxState, onCheckInvoked, onClickDeleteButton,
  } = props;

  return (
    <>
      {/** todo: implement the design for CheckboxType = INDETERMINATE */}
      {/** refs: https://estoc.weseek.co.jp/redmine/issues/81246  */}
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="custom-control custom-checkbox ml-1 align-self-center"
        onClick={onCheckInvoked}
        checked={checkboxState !== CheckboxType.NONE_CHECKED}
      />
      <button
        type="button"
        className="btn text-danger font-weight-light p-0 ml-3"
        onClick={() => {
          if (onClickDeleteButton == null) { logger.error('onClickDeleteButton is null') }
          else { onClickDeleteButton() }
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
