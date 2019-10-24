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

  renderModeLabel(mode) {
    let label = null;
    switch (mode) {
      case 'insert':
        label = <span className="text-info"><i className="icon-plus"></i> Insert</span>;
        break;
      case 'upsert':
        label = <span className="text-success"><i className="icon-plus"></i> Upsert</span>;
        break;
      case 'flushAndInsert':
        label = <span className="text-danger"><i className="icon-refresh"></i> Flush and Insert</span>;
        break;
    }
    return label;
  }

  renderControls() {
    const {
      collectionName, option, isSelected,
    } = this.props;

    return (
      <div className="d-flex justify-content-between align-items-center">
        {/* left */}
        <div className="checkbox checkbox-info my-0">
          <input
            type="checkbox"
            id={collectionName}
            name={collectionName}
            className="form-check-input"
            value={collectionName}
            checked={isSelected}
            onChange={this.changeHandler}
          />
          <label className="text-capitalize form-check-label" htmlFor={collectionName}>
            {collectionName}
          </label>
        </div>
        {/* right */}
        <span className="d-inline-flex align-items-center">
          Mode:&nbsp;
          <div className="dropdown d-inline-block">
            <button
              className="btn btn-default btn-xs dropdown-toggle"
              type="button"
              id="ddmMode"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="true"
            >
              {this.renderModeLabel(option.mode)}
              <span className="caret ml-2"></span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="ddmMode">
              { ['insert', 'upsert', 'flushAndInsert'].map((mode) => {
                return (
                  <li>
                    <a href="#" onClick={() => this.modeSelectedHandler(mode)}>
                      {this.renderModeLabel(mode)}
                    </a>
                  </li>
                );
              }) }
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
