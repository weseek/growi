import { useEffect } from 'react';

import { useSearchModal } from '~/features/search/client/stores/search';
import { useIsEditable } from '~/states/context';


const FocusToGlobalSearch = (props) => {
  const isEditable = useIsEditable();
  const { data: searchModalData, open: openSearchModal } = useSearchModal();

  // setup effect
  useEffect(() => {
    if (!isEditable) {
      return;
    }

    if (!searchModalData.isOpened) {
      openSearchModal();
      // remove this
      props.onDeleteRender();
    }

  }, [isEditable, openSearchModal, props, searchModalData.isOpened]);

  return null;
};

FocusToGlobalSearch.getHotkeyStrokes = () => {
  return [['/']];
};

export default FocusToGlobalSearch;
