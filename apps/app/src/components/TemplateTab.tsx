import React from 'react';

type Props = {
  template: any,
  onChangeHandler: any,
}

// const onChangeHandler = () => {

// }

export const TemplateTab = (props: Props): JSX.Element => {
  const { template, onChangeHandler } = props;

  return (
    <div key={template.name} className="custom-control custom-radio">
      <input
        type="radio"
        className="custom-control-input"
        id="string"
        value={template.value}
        // checked={this.state.linkerType === template.value}
        onChange={onChangeHandler}
      />
      <label className="custom-control-label" htmlFor="string">
        {template.name}
      </label>
    </div>
  );
};
