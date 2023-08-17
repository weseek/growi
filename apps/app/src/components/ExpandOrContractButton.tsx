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
      className={`btn ${isWindowExpanded ? 'icon-size-actual' : 'icon-size-fullscreen'}`}
      onClick={isWindowExpanded ? clickContractButtonHandler : clickExpandButtonHandler}
    >
    </button>
  );
};


export default ExpandOrContractButton;
