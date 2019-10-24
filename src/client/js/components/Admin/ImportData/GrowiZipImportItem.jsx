import React from 'react';
import PropTypes from 'prop-types';


// eslint-disable-next-line no-unused-vars
import { withTranslation } from 'react-i18next';


import GrowiZipImportOption from '../../../models/GrowiZipImportOption';


const MODE_ATTR_MAP = {
  insert: { color: 'info', icon: 'icon-plus', label: 'Insert' },
  upsert: { color: 'success', icon: 'icon-plus', label: 'Upsert' },
  flushAndInsert: { color: 'danger', icon: 'icon-refresh', label: 'Flush and Insert' },
};

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

  renderModeLabel(mode, isColorized = false) {
    const attrMap = MODE_ATTR_MAP[mode];
    const className = isColorized ? `text-${attrMap.color}` : '';
    return <span className={className}><i className={attrMap.icon}></i> {attrMap.label}</span>;
  }

  renderControls() {
    const {
      collectionName, option, isSelected,
    } = this.props;

    const attrMap = MODE_ATTR_MAP[option.mode];
    const btnColor = `btn-${attrMap.color}`;

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
              className={`btn ${btnColor} btn-xs dropdown-toggle`}
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
                  <li key={`buttonMode_${mode}`}>
                    <a href="#" onClick={() => this.modeSelectedHandler(mode)}>
                      {this.renderModeLabel(mode, true)}
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
