import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';
import { CheckboxType } from '../../interfaces/search';

const logger = loggerFactory('growi:searchResultList');

type Props = {
  checkboxState: CheckboxType,
  onClickInvoked?: () => void,
  onCheckInvoked?: () => void,
}

const DeleteSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    checkboxState, onClickInvoked, onCheckInvoked,
  } = props;

  const onCheckAllPages = () => {
    if (props.onClickInvoked == null) { logger.error('onClickInvoked is null') }
    else { props.onClickInvoked() }
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
