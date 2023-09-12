import React, { useState } from 'react';

import { NewPageCreateButton } from './NewPageCreateButton';
import { NewPageInput } from './NewPageInput';

export const useNewPageInput = () => {

  const [isNewPageInputShown, setNewPageInputShown] = useState(false);

  const NewPageCreateButtonWrapper = (props) => {
    return (
      <NewPageCreateButton
        page={props.page}
        children={props.children}
        stateHandlers={props.stateHandlers}
        setNewPageInputShown={setNewPageInputShown}
      />
    );
  };

  const NewPageInputWrapper = (props) => {
    return (
      <NewPageInput
        page={props.page}
        isEnableActions={props.isEnableActions}
        children={props.chilren}
        stateHandlers={props.stateHandlers}
        isNewPageInputShown={isNewPageInputShown}
        setNewPageInputShown={setNewPageInputShown}
      />
    );
  };


  return {
    NewPageInputWrapper,
    NewPageCreateButtonWrapper,
  };
};
