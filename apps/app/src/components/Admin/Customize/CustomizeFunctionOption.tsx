import React from 'react';

type Props = {
  optionId: string
  label: string,
  isChecked: boolean,
  onChecked: () => void,
  children: React.ReactNode,
}

const CustomizeFunctionOption = (props: Props): JSX.Element => {

  const {
    optionId, label, isChecked, onChecked, children,
  } = props;

  return (
    <React.Fragment>
      <div className="custom-control custom-checkbox custom-checkbox-success">
        <input
          className="custom-control-input"
          type="checkbox"
          id={optionId}
          checked={isChecked}
          onChange={onChecked}
        />
        <label className="form-label custom-control-label" htmlFor={optionId}>
          <strong>{label}</strong>
        </label>
      </div>
      {children}
    </React.Fragment>
  );

};

export default CustomizeFunctionOption;
