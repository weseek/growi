import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import NavigationContainer from '~/client/services/NavigationContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
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
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  onDeleteRender: PropTypes.func.isRequired,
};

const EditPageWrapper = withUnstatedContainers(EditPage, [NavigationContainer]);

EditPageWrapper.getHotkeyStrokes = () => {
  return [['e']];
};

export default EditPageWrapper;
