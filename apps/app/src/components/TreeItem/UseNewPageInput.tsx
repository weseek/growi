import React, { useState, FC } from 'react';

import { ItemNode } from './ItemNode';
import { NewPageCreateButton } from './NewPageCreateButton';
import { NewPageInput } from './NewPageInput';
import { SimpleItemToolProps } from './SimpleItem';
import { StateHandlersType } from './state-handlers-type';

type UseNewPageInputProps = SimpleItemToolProps & {children: ItemNode[], stateHandlers: StateHandlersType };

export const useNewPageInput = () => {

  const [isNewPageInputShown, setNewPageInputShown] = useState(false);

  const NewPageCreateButtonWrapper: FC<UseNewPageInputProps> = (props) => {
    return (
      <NewPageCreateButton
        page={props.page}
        currentChildren={props.children}
        stateHandlers={props.stateHandlers}
        setNewPageInputShown={setNewPageInputShown}
      />
    );
  };

  const NewPageInputWrapper: FC<UseNewPageInputProps> = (props) => {
    return (
      <NewPageInput
        page={props.page}
        isEnableActions={props.isEnableActions}
        currentChildren={props.children}
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
