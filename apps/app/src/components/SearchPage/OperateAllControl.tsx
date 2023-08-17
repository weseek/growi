import React, {
  ChangeEvent, forwardRef, ForwardRefRenderFunction, useImperativeHandle, useRef,
} from 'react';

import { Input } from 'reactstrap';

import { ISelectableAndIndeterminatable } from '~/client/interfaces/selectable-all';
import { IndeterminateInputElement } from '~/interfaces/indeterminate-input-elm';

type Props = {
  isCheckboxDisabled?: boolean,
  onCheckboxChanged?: (isChecked: boolean) => void,
  children?: React.ReactNode,
}

const OperateAllControlSubstance: ForwardRefRenderFunction<ISelectableAndIndeterminatable, Props> = (props: Props, ref): JSX.Element => {
  const {
    isCheckboxDisabled,
    onCheckboxChanged,
    children,
  } = props;

  const selectAllCheckboxElm = useRef<IndeterminateInputElement>(null);

  // publish ISelectable methods
  useImperativeHandle(ref, () => ({
    select: () => {
      const input = selectAllCheckboxElm.current;
      if (input != null) {
        input.checked = true;
        input.indeterminate = false;
      }
    },
    deselect: () => {
      const input = selectAllCheckboxElm.current;
      if (input != null) {
        input.checked = false;
        input.indeterminate = false;
      }
    },
    setIndeterminate: () => {
      const input = selectAllCheckboxElm.current;
      if (input != null) {
        input.indeterminate = true;
      }
    },
  }));

  const checkboxChangedHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (onCheckboxChanged != null) {
      onCheckboxChanged(e.target.checked);
    }
  };

  return (
    <div className="d-flex align-items-center">
      <Input
        type="checkbox"
        id="cb-check-all"
        data-testid="cb-select-all"
        innerRef={selectAllCheckboxElm}
        disabled={isCheckboxDisabled}
        onChange={checkboxChangedHandler}
      />
      {children}
    </div>
  );
};

export const OperateAllControl = React.memo(forwardRef(OperateAllControlSubstance));
