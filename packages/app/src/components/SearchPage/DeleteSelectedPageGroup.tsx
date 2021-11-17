import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckboxType } from '../../interfaces/search';

type Props = {
  selectedPagesCount: number,
  displayPageCount: number,
  onClickInvoked?: () => void,
  onClickSelectAllCheckbox?: () => void,
}

const DeleteSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    onClickInvoked, onClickSelectAllCheckbox, selectedPagesCount, displayPageCount,
  } = props;

  const checkboxType = useMemo(() => {
    switch (selectedPagesCount) {
      case 0:
        return CheckboxType.NONE_CHECKED;
      case displayPageCount:
        return CheckboxType.ALL_CHECKED;
      default:
        return CheckboxType.INDETERMINATE;
    }
  }, [selectedPagesCount, displayPageCount]);

  return (
    <>
      {/** todo: implement the design for CheckboxType = INDETERMINATE */}
      {/** refs: https://estoc.weseek.co.jp/redmine/issues/81246  */}
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="custom-control custom-checkbox ml-1 align-self-center"
        onClick={() => {
          if (onClickSelectAllCheckbox != null) {
            onClickSelectAllCheckbox();
          }
        }}
        checked={checkboxType !== CheckboxType.NONE_CHECKED}
      />
      <button
        type="button"
        className="btn text-danger font-weight-light p-0 ml-3"
        onClick={() => {
          if (onClickInvoked != null) {
            onClickInvoked();
          }
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
