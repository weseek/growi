import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useCreateModalStatus } from '~/stores/ui';

const CreatePage = React.memo((props) => {

  const { mutate: mutateModalStatus } = useCreateModalStatus();

  // setup effect
  useEffect(() => {
    mutateModalStatus({ isOpened: true });

    // remove this
    props.onDeleteRender(this);
  }, [mutateModalStatus, props]);

  return <></>;
});

CreatePage.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

CreatePage.getHotkeyStrokes = () => {
  return [['c']];
};

export default CreatePage;
