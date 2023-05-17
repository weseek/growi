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
      className="close"
      onClick={isWindowExpanded ? clickContractButtonHandler : clickExpandButtonHandler}
    >
      <i className={`${isWindowExpanded ? 'icon-size-actual' : 'icon-size-fullscreen'}`} style={{ fontSize: '0.8em' }} aria-hidden="true"></i>
    </button>
  );
};


export default ExpandOrContractButton;
