import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { usePageCreateModalOpened } from '~/stores/ui';

const CreatePage = React.memo((props) => {

  const { mutate } = usePageCreateModalOpened();

  // setup effect
  useEffect(() => {
    mutate(true);

    // remove this
    props.onDeleteRender(this);
  }, [mutate, props]);

  return <></>;
});

CreatePage.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

CreatePage.getHotkeyStrokes = () => {
  return [['c']];
};

export default CreatePage;
