import React from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line no-unused-vars
import { withTranslation } from 'react-i18next';

import ProgressBar from 'react-bootstrap/es/ProgressBar';

import GrowiArchiveImportOption from '@commons/models/admin/growi-archive-import-option';


const MODE_ATTR_MAP = {
  insert: { color: 'info', icon: 'icon-plus', label: 'Insert' },
  upsert: { color: 'success', icon: 'icon-plus', label: 'Upsert' },
  flushAndInsert: { color: 'danger', icon: 'icon-refresh', label: 'Flush and Insert' },
};

export const DEFAULT_MODE = 'insert';

export const MODE_RESTRICTED_COLLECTION = {
  configs: ['flushAndInsert'],
  users: ['insert', 'upsert'],
};

export default class GrowiZipImportItem extends React.Component {

  constructor(props) {
    super(props);

    this.changeHandler = this.changeHandler.bind(this);
    this.modeSelectedHandler = this.modeSelectedHandler.bind(this);
    this.configButtonClickedHandler = this.configButtonClickedHandler.bind(this);
    this.errorLinkClickedHandler = this.errorLinkClickedHandler.bind(this);
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

  configButtonClickedHandler() {
    const { collectionName, onConfigButtonClicked } = this.props;

    if (onConfigButtonClicked == null) {
      return;
    }

    onConfigButtonClicked(collectionName);
  }

  errorLinkClickedHandler() {
    const { collectionName, onErrorLinkClicked } = this.props;

    if (onErrorLinkClicked == null) {
      return;
    }

    onErrorLinkClicked(collectionName);
  }

  renderModeLabel(mode, isColorized = false) {
    const attrMap = MODE_ATTR_MAP[mode];
    const className = isColorized ? `text-${attrMap.color}` : '';
    return <span className={className}><i className={attrMap.icon}></i> {attrMap.label}</span>;
  }

  renderCheckbox() {
    const {
      collectionName, isSelected,
    } = this.props;

    return (
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
    );
  }

  renderModeSelector() {
    const {
      collectionName, option,
    } = this.props;

    const attrMap = MODE_ATTR_MAP[option.mode];
    const btnColor = `btn-${attrMap.color}`;

    const modes = MODE_RESTRICTED_COLLECTION[collectionName] || Object.keys(MODE_ATTR_MAP);

    return (
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
            { modes.map((mode) => {
              return (
                <li key={`buttonMode_${mode}`}>
                  <a type="button" role="button" onClick={() => this.modeSelectedHandler(mode)}>
                    {this.renderModeLabel(mode, true)}
                  </a>
                </li>
              );
            }) }
          </ul>
        </div>
      </span>
    );
  }

  renderConfigButton() {
    const { isConfigButtonAvailable } = this.props;

    return (
      <button
        type="button"
        className="btn btn-default btn-xs ml-2"
        disabled={!isConfigButtonAvailable}
        onClick={isConfigButtonAvailable ? this.configButtonClickedHandler : null}
      >
        <i className="icon-settings"></i>
      </button>
    );
  }

  renderProgressBar() {
    const {
      isImporting, insertedCount, modifiedCount, errorsCount,
    } = this.props;

    const total = insertedCount + modifiedCount + errorsCount;

    return (
      <ProgressBar className="mb-0">
        <ProgressBar max={total} striped={isImporting} active={isImporting} now={insertedCount} bsStyle="info" />
        <ProgressBar max={total} striped={isImporting} active={isImporting} now={modifiedCount} bsStyle="success" />
        <ProgressBar max={total} striped={isImporting} active={isImporting} now={errorsCount} bsStyle="danger" />
      </ProgressBar>
    );
  }

  renderBody() {
    const { isImported } = this.props;

    if (!isImported) {
      return 'Ready';
    }

    const { insertedCount, modifiedCount, errorsCount } = this.props;
    return (
      <div className="w-100 text-center">
        <span className="text-info"><strong>{insertedCount}</strong> Inserted</span>,&nbsp;
        <span className="text-success"><strong>{modifiedCount}</strong> Modified</span>,&nbsp;
        { errorsCount > 0
          ? <a className="text-danger" role="button" onClick={this.errorLinkClickedHandler}><u><strong>{errorsCount}</strong> Failed</u></a>
          : <span className="text-muted"><strong>0</strong> Failed</span>
        }
      </div>
    );

  }

  render() {
    const {
      isSelected,
    } = this.props;

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <div className="d-flex justify-content-between align-items-center">
            {/* left */}
            {this.renderCheckbox()}
            {/* right */}
            <span className="d-flex align-items-center">
              {this.renderModeSelector()}
              {this.renderConfigButton()}
            </span>
          </div>
        </div>
        { isSelected && (
          <>
            {this.renderProgressBar()}
            <div className="panel-body">
              {this.renderBody()}
            </div>
          </>
        ) }
      </div>
    );
  }

}

GrowiZipImportItem.propTypes = {
  collectionName: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  option: PropTypes.instanceOf(GrowiArchiveImportOption).isRequired,

  isImporting: PropTypes.bool.isRequired,
  isImported: PropTypes.bool.isRequired,
  insertedCount: PropTypes.number,
  modifiedCount: PropTypes.number,
  errorsCount: PropTypes.number,

  isConfigButtonAvailable: PropTypes.bool,

  onChange: PropTypes.func,
  onOptionChange: PropTypes.func,
  onConfigButtonClicked: PropTypes.func,
  onErrorLinkClicked: PropTypes.func,
};

GrowiZipImportItem.defaultProps = {
  insertedCount: 0,
  modifiedCount: 0,
  errorsCount: 0,
};
