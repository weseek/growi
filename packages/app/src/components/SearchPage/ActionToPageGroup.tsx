import React, { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IndeterminateInputElement } from '~/interfaces/indeterminate-input-elm';
import { CheckboxType, ActionToPagesType } from '../../interfaces/search';


type Props = {
  actionType : ActionToPagesType,
  isSelectAllCheckboxDisabled: boolean,
  selectAllCheckboxType: CheckboxType,
  onClickActionButton?: () => void,
  onClickSelectAllCheckbox?: (nextSelectAllCheckboxType: CheckboxType) => void,
}

const DeleteSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    onClickActionButton, onClickSelectAllCheckbox, selectAllCheckboxType,
  } = props;

  const onClickCheckbox = () => {
    if (onClickSelectAllCheckbox != null) {
      const next = selectAllCheckboxType === CheckboxType.ALL_CHECKED ? CheckboxType.NONE_CHECKED : CheckboxType.ALL_CHECKED;
      onClickSelectAllCheckbox(next);
    }
  };

  const onClickDeleteButton = () => {
    if (onClickActionButton != null) { onClickActionButton() }
  };

  const selectAllCheckboxElm = useRef<IndeterminateInputElement>(null);
  useEffect(() => {
    if (selectAllCheckboxElm.current != null) {
      selectAllCheckboxElm.current.indeterminate = selectAllCheckboxType === CheckboxType.INDETERMINATE;
    }
  }, [selectAllCheckboxType]);

  return (

    <div className="d-flex align-items-center">
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="grw-indeterminate-checkbox"
        ref={selectAllCheckboxElm}
        disabled={props.isSelectAllCheckboxDisabled}
        onClick={onClickCheckbox}
        checked={selectAllCheckboxType === CheckboxType.ALL_CHECKED}
      />
      <button
        type="button"
        className="btn text-danger font-weight-light p-0 ml-2"
        disabled={selectAllCheckboxType === CheckboxType.NONE_CHECKED}
        onClick={onClickDeleteButton}
      >
        {props.actionType === ActionToPagesType.DELETE
        && (
          <>
            <i className="icon-trash"></i>
            {t('search_result.delete_all_selected_page')}
          </>
        )}

        {props.actionType === ActionToPagesType.MIGRATE
        && (
          <>
            {/* TODO migrate text and icon here */}
            {/* https://redmine.weseek.co.jp/issues/85465 */}
            migrate all
          </>
        )}

      </button>
    </div>
  );

};

export default DeleteSelectedPageGroup;
