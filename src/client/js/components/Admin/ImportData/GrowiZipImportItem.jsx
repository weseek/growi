import React from 'react';
import PropTypes from 'prop-types';


// eslint-disable-next-line no-unused-vars
import { withTranslation } from 'react-i18next';


export default class GrowiZipImportItem extends React.PureComponent {

  constructor(props) {
    super(props);

    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(e) {
    const { collectionName, onChange } = this.props;

    if (onChange != null) {
      onChange(collectionName, e.target.checked);
    }
  }

  render() {
    const {
      collectionName, isSelected,
    } = this.props;

    return (
      <>
        <input
          type="checkbox"
          id={collectionName}
          name={collectionName}
          className="form-check-input"
          value={collectionName}
          checked={isSelected}
          onChange={this.changeHandler}
        />
        <label className="text-capitalize form-check-label ml-3" htmlFor={collectionName}>
          {collectionName}
        </label>
      </>
    );
  }

}

GrowiZipImportItem.propTypes = {
  collectionName: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,

  onChange: PropTypes.func,
};
