import React, { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IndeterminateInputElement } from '~/interfaces/indeterminate-input-elm';
import { CheckboxType } from '~/interfaces/search';

type Props = {
  isSelectAllCheckboxDisabled: boolean,
  selectAllCheckboxType: CheckboxType,
  onClickActionAllButton?: () => void,
  onClickSelectAllCheckbox?: (nextSelectAllCheckboxType: CheckboxType) => void,
  actionIconAndText : JSX.Element,
}

const ActionToSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    onClickActionAllButton, onClickSelectAllCheckbox, selectAllCheckboxType,
  } = props;

  const onClickCheckbox = () => {
    if (onClickSelectAllCheckbox != null) {
      const next = selectAllCheckboxType === CheckboxType.ALL_CHECKED ? CheckboxType.NONE_CHECKED : CheckboxType.ALL_CHECKED;
      onClickSelectAllCheckbox(next);
    }
  };

  const onClickActionButton = () => {
    if (onClickActionAllButton != null) { onClickActionAllButton() }
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
        onClick={onClickActionButton}
      >
        {props.actionIconAndText}
      </button>
    </div>
  );

};

export default ActionToSelectedPageGroup;
