import { FC, useEffect } from 'react';

import { useIsEditable } from '~/stores/context';
import { useGlobalSearchFormRef } from '~/stores/ui';

const FocusToGlobalSearch = (props) => {
  const { data: isEditable } = useIsEditable();
  const { data: globalSearchFormRef } = useGlobalSearchFormRef();

  // setup effect
  useEffect(() => {
    if (!isEditable) {
      return;
    }

    // ignore when dom that has 'modal in' classes exists
    if (document.getElementsByClassName('modal in').length > 0) {
      return;
    }

    globalSearchFormRef.current.focus();

    // remove this
    props.onDeleteRender();
  }, [globalSearchFormRef, isEditable, props]);

  return null;
};

FocusToGlobalSearch.getHotkeyStrokes = () => {
  return [['/']];
};

export default FocusToGlobalSearch;
