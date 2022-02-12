import React, {
  ChangeEvent, FC, useEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { IndeterminateInputElement } from '~/interfaces/indeterminate-input-elm';
import { CheckboxType } from '../../interfaces/search';


export type SelectAllHook = {
  isIndeterminate: boolean,
  setSelectedCount: (selectedCount: number) => void,
}

export const useSelectAll = (totalItemsCount: number | undefined): SelectAllHook => {
  const [selectedCount, setSelectedCount] = useState(0);

  const isIndeterminate = useMemo(() => {
    return selectedCount > 0 && selectedCount !== totalItemsCount;
  }, [selectedCount, totalItemsCount]);

  return {
    isIndeterminate,
    setSelectedCount,
  };
};


type Props = {
  // selectAllCheckboxType: CheckboxType,
  isSelectedPageCountIndeterminate?: boolean,
  isSelectAllCheckboxDisabled?: boolean,
  isDeleteAllButtonDisabled?: boolean,
  onClickDeleteAllButton?: () => void,
  onClickSelectAllCheckbox?: (nextSelectAllCheckboxType: CheckboxType) => void,
}

export const OperateAllControl :FC<Props> = React.memo((props: Props) => {
  const { t } = useTranslation();
  const {
    isSelectedPageCountIndeterminate,
    isSelectAllCheckboxDisabled,
    isDeleteAllButtonDisabled,
    onClickDeleteAllButton, onClickSelectAllCheckbox,
  } = props;

  const checkboxChangedHandler = (e: ChangeEvent<HTMLInputElement>) => {
    // e.preventDefault();

    // if (onClickSelectAllCheckbox != null) {
    //   const next = selectAllCheckboxType === CheckboxType.ALL_CHECKED ? CheckboxType.NONE_CHECKED : CheckboxType.ALL_CHECKED;
    //   onClickSelectAllCheckbox(next);
    // }
  };

  const onClickDeleteButton = () => {
    if (onClickDeleteAllButton != null) { onClickDeleteAllButton() }
  };

  const selectAllCheckboxElm = useRef<IndeterminateInputElement>(null);
  // useEffect(() => {
  //   if (selectAllCheckboxElm.current != null) {
  //     selectAllCheckboxElm.current.indeterminate = selectAllCheckboxType === CheckboxType.INDETERMINATE;
  //   }
  // }, [selectAllCheckboxType]);

  useEffect(() => {
    if (selectAllCheckboxElm.current != null && isSelectedPageCountIndeterminate) {
      selectAllCheckboxElm.current.indeterminate = true;
    }
  }, [isSelectedPageCountIndeterminate]);

  return (

    <div className="d-flex align-items-center">
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="grw-indeterminate-checkbox"
        ref={selectAllCheckboxElm}
        // disabled={props.isSelectAllCheckboxDisabled}
        // onChange={checkboxChangedHandler}
        // checked={selectAllCheckboxType === CheckboxType.ALL_CHECKED}
      />
      <button
        type="button"
        className="btn text-danger font-weight-light p-0 ml-2"
        disabled={isDeleteAllButtonDisabled}
        onClick={onClickDeleteButton}
      >
        <i className="icon-trash"></i>
        {t('search_result.delete_all_selected_page')}
      </button>
    </div>
  );

});
