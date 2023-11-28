import React, { FC } from 'react';

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
      className="btn"
      onClick={isWindowExpanded ? clickContractButtonHandler : clickExpandButtonHandler}
    >
      <span className="material-symbols-outlined">{isWindowExpanded ? 'close_fullscreen' : 'open_in_full'}</span>
    </button>
  );
};


export default ExpandOrContractButton;
