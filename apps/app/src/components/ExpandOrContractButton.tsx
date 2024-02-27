import type { FC } from 'react';
import React from 'react';

type Props = {
  isWindowExpanded: boolean,
  contractWindow?: () => void,
  expandWindow?: () => void,
};

const ExpandOrContractButton: FC<Props> = (props: Props) => {
  const { isWindowExpanded, contractWindow, expandWindow } = props;

  const clickContractButtonHandler = (): void => {
    if (contractWindow != null) {
      contractWindow();
    }
  };

  const clickExpandButtonHandler = (): void => {
    if (expandWindow != null) {
      expandWindow();
    }
  };

  return (
    <button
      type="button"
      className="btn material-symbols-outlined"
      onClick={isWindowExpanded ? clickContractButtonHandler : clickExpandButtonHandler}
    >
      {isWindowExpanded ? 'close_fullscreen' : 'open_in_full'}
    </button>
  );
};


export default ExpandOrContractButton;
