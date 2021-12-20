import React, {
  FC, useMemo, useEffect, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { CheckboxType } from '../../interfaces/search';

type Props = {
  isSelectAllCheckboxDisabled: boolean,
  selectAllCheckboxType: CheckboxType,
  onClickDeleteAllButton?: () => void,
  onClickSelectAllCheckbox?: (nextSelectAllCheckboxType: CheckboxType) => void,
}

const DeleteSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    onClickDeleteAllButton, onClickSelectAllCheckbox, selectAllCheckboxType,
  } = props;

  const onClickCheckbox = () => {
    if (onClickSelectAllCheckbox != null) {
      const next = selectAllCheckboxType === CheckboxType.ALL_CHECKED ? CheckboxType.NONE_CHECKED : CheckboxType.ALL_CHECKED;
      onClickSelectAllCheckbox(next);
    }
  };

  const onClickDeleteButton = () => {
    if (onClickDeleteAllButton != null) { onClickDeleteAllButton() }
  };

  const isIndeterminate = useMemo(() => {
    return selectAllCheckboxType === CheckboxType.INDETERMINATE;
  }, [selectAllCheckboxType]);

  const elm = useRef(null);
  useEffect(() => {
    if (elm.current != null) {
      console.log(elm.current.attributes);
      const indeterminate = selectAllCheckboxType === CheckboxType.INDETERMINATE;
    }
  }, [selectAllCheckboxType]);

  return (

    <div className="d-flex align-items-center">
      {/** todo: implement the design for CheckboxType = INDETERMINATE */}
      <div className="custom-control custom-checkbox">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <input type="checkbox" className="custom-control-input" id="customCheck1" ref={elm} indeterminate={isIndeterminate} />
        <label className="custom-control-label" htmlFor="customCheck1"></label>
      </div>
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="custom-control custom-checkbox align-self-center"
        disabled={props.isSelectAllCheckboxDisabled}
        onClick={onClickCheckbox}
        checked={selectAllCheckboxType !== CheckboxType.NONE_CHECKED}
      />
      <button
        type="button"
        className="btn text-danger font-weight-light p-0 ml-2"
        disabled={selectAllCheckboxType === CheckboxType.NONE_CHECKED}
        onClick={onClickDeleteButton}
      >
        <i className="icon-trash"></i>
        {t('search_result.delete_all_selected_page')}
      </button>
    </div>
  );

};

export default DeleteSelectedPageGroup;
