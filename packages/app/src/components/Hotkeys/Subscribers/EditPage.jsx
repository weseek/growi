import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { EditorMode, useEditorMode } from '~/stores/ui';

const EditPage = (props) => {
  const { mutate: mutateEditorMode } = useEditorMode();

  // setup effect
  useEffect(() => {
    // ignore when dom that has 'modal in' classes exists
    if (document.getElementsByClassName('modal in').length > 0) {
      return;
    }

    mutateEditorMode(EditorMode.Editor);

    // remove this
    props.onDeleteRender(this);
  }, [mutateEditorMode, props]);

  return <></>;
};

EditPage.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

EditPage.getHotkeyStrokes = () => {
  return [['e']];
};

export default EditPage;
