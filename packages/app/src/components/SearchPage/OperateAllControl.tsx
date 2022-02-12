import React, {
  ChangeEvent, FC, useEffect, useMemo, useRef, useState,
} from 'react';
import { IndeterminateInputElement } from '~/interfaces/indeterminate-input-elm';
import { CheckboxType } from '~/interfaces/search';


export type SelectAllHook = {
  checkboxType: CheckboxType,
  setSelectedCount: (selectedCount: number) => void,
}

export const useSelectAll = (totalItemsCount: number | undefined): SelectAllHook => {
  const [selectedCount, setSelectedCount] = useState(0);

  const checkboxType = useMemo(() => {
    if (selectedCount === 0) {
      return CheckboxType.NONE_CHECKED;
    }
    if (selectedCount === totalItemsCount) {
      return CheckboxType.ALL_CHECKED;
    }
    return CheckboxType.INDETERMINATE;
  }, [selectedCount, totalItemsCount]);

  return {
    checkboxType,
    setSelectedCount,
  };
};


type Props = {
  checkboxType: CheckboxType,
  isCheckboxDisabled?: boolean,
  onCheckboxChanged?: (isChecked: boolean) => void,

  children?: React.ReactNode,
}

export const OperateAllControl :FC<Props> = React.memo((props: Props) => {
  const {
    checkboxType,
    isCheckboxDisabled,
    onCheckboxChanged,

    children,
  } = props;

  const checkboxChangedHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (onCheckboxChanged != null) {
      onCheckboxChanged(e.target.checked);
    }
  };

  const selectAllCheckboxElm = useRef<IndeterminateInputElement>(null);
  useEffect(() => {
    const checkbox = selectAllCheckboxElm.current;
    if (checkbox == null) {
      return;
    }


    switch (checkboxType) {
      case CheckboxType.NONE_CHECKED:
        checkbox.indeterminate = false;
        checkbox.checked = false;
        break;
      case CheckboxType.ALL_CHECKED:
        checkbox.indeterminate = false;
        checkbox.checked = true;
        break;
      case CheckboxType.INDETERMINATE:
        checkbox.indeterminate = true;
        break;
    }
  }, [checkboxType]);

  return (

    <div className="d-flex align-items-center">
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="grw-indeterminate-checkbox"
        ref={selectAllCheckboxElm}
        disabled={isCheckboxDisabled}
        onChange={checkboxChangedHandler}
      />
      {children}
    </div>
  );

});
