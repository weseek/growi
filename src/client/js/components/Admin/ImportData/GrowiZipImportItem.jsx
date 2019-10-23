import React from 'react';
import PropTypes from 'prop-types';


// eslint-disable-next-line no-unused-vars
import { withTranslation } from 'react-i18next';


import GrowiZipImportOption from '../../../models/GrowiZipImportOption';


export const DEFAULT_MODE = 'insert';

export default class GrowiZipImportItem extends React.Component {

  constructor(props) {
    super(props);

    this.changeHandler = this.changeHandler.bind(this);
    this.modeSelectedHandler = this.modeSelectedHandler.bind(this);
  }

  get currentModeLabel() {
    const { option } = this.props;
    const { mode } = option;

    // convert 'insert' -> 'Insert'
    return mode.substring(0, 1).toUpperCase() + mode.substring(1);
  }

  changeHandler(e) {
    const { collectionName, onChange } = this.props;

    if (onChange != null) {
      onChange(collectionName, e.target.checked);
    }
  }

  modeSelectedHandler(mode) {
    const { collectionName, onOptionChange } = this.props;

    if (onOptionChange == null) {
      return;
    }

    const { option } = this.props;
    option.mode = mode;

    onOptionChange(collectionName, option);
  }

  renderControls() {
    const {
      collectionName, isSelected,
    } = this.props;

    return (
      <div className="d-flex justify-content-between align-items-center">
        {/* left */}
        <div>
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
        </div>
        {/* right */}
        <span className="d-inline-flex align-items-center">
          Mode:
          <div className="dropdown d-inline-block">
            <button className="btn btn-default btn-xs dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              {this.currentModeLabel}
              <span className="caret ml-2"></span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
              <li><a href="#" onClick={() => this.modeSelectedHandler('insert')}>Insert</a></li>
              <li><a href="#" onClick={() => this.modeSelectedHandler('upsert')}>Upsert</a></li>
              <li><a href="#" onClick={() => this.modeSelectedHandler('flushAndInsert')}>Flush and Insert</a></li>
            </ul>
          </div>
        </span>
      </div>
    );
  }

  render() {
    const {
      isSelected,
    } = this.props;

    const cotrols = this.renderControls();

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          {cotrols}
        </div>
        { isSelected && (
          <div className="panel-body">
            Ready
          </div>
        ) }
      </div>
    );
  }

}

GrowiZipImportItem.propTypes = {
  collectionName: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  option: PropTypes.instanceOf(GrowiZipImportOption).isRequired,

  onChange: PropTypes.func,
  onOptionChange: PropTypes.func,
};
