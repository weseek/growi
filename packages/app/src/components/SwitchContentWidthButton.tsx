import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';


interface Props {
  isContainerFluid?: boolean,
  onSwitchContentWidthClicked: () => void;
}

const SwitchContentWidthButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { isContainerFluid, onSwitchContentWidthClicked } = props;


  const handleClick = async() => {
    if (onSwitchContentWidthClicked != null) {
      onSwitchContentWidthClicked();
    }
  };
  return (
    <div className="btn-group" role="group" aria-label="Switch content width">
      <button
        type="button"
        id="default-container-button"
        onClick={handleClick}
        className={`btn btn-switch-content-width border-1 ${!isContainerFluid ? 'active' : ''}`}
      >
        <i className="fa fa-compress" aria-hidden="true"></i>

      </button>
      <UncontrolledTooltip placement="top" target="default-container-button" fade={false}>
        Default container width
      </UncontrolledTooltip>
      <button
        type="button"
        id="fluid-container-button"
        onClick={handleClick}
        className={`btn btn-switch-content-width border-1 ${isContainerFluid ? 'active' : ''}`}
      >
        <i className="fa fa-expand" aria-hidden="true"></i>
      </button>
      <UncontrolledTooltip placement="top" target="fluid-container-button" fade={false}>
        Fluid container width
      </UncontrolledTooltip>
    </div>
  );
};

export default SwitchContentWidthButton;
