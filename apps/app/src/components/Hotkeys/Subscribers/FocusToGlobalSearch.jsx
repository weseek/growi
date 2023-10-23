import { useEffect } from 'react';

import { useIsEditablePage } from '~/stores/page';
import { useGlobalSearchFormRef } from '~/stores/ui';

const FocusToGlobalSearch = (props) => {
  const { data: isEditablePage } = useIsEditablePage();
  const { data: globalSearchFormRef } = useGlobalSearchFormRef();

  // setup effect
  useEffect(() => {
    if (!isEditablePage) {
      return;
    }

    // ignore when dom that has 'modal in' classes exists
    if (document.getElementsByClassName('modal in').length > 0) {
      return;
    }

    globalSearchFormRef.current.focus();

    // remove this
    props.onDeleteRender();
  }, [globalSearchFormRef, isEditablePage, props]);

  return null;
};

FocusToGlobalSearch.getHotkeyStrokes = () => {
  return [['/']];
};

export default FocusToGlobalSearch;
