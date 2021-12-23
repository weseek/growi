import { FC, useEffect } from 'react';

import { useIsEditable } from '~/stores/context';

const FocusToGlobalSearch = (props) => {
  const { data: isEditable } = useIsEditable();

  // setup effect
  useEffect(() => {
    if (!isEditable) {
      return;
    }

    // ignore when dom that has 'modal in' classes exists
    if (document.getElementsByClassName('modal in').length > 0) {
      return;
    }

    console.log('focus to GlobalSearch');

    // remove this
    props.onDeleteRender();
  }, [isEditable, props]);

  return null;
};

FocusToGlobalSearch.getHotkeyStrokes = () => {
  return [['/']];
};

export default FocusToGlobalSearch;
