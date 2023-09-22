import React, { useState, FC } from 'react';

import { ItemNode } from '../ItemsTree';

import { NewPageCreateButton } from './NewPageCreateButton';
import { NewPageInput } from './NewPageInput';
import { SimpleItemToolProps } from './SimpleItem';

type UseNewPageInputProps = SimpleItemToolProps & {children: ItemNode[], stateHandlers};

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

  const NewPageInputWrapper = (props) => {
    return (
      <NewPageInput
        page={props.page}
        isEnableActions={props.isEnableActions}
        currentChildren={props.chilren}
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
