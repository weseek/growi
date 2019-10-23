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

  renderControls() {
    const {
      collectionName, isSelected,
    } = this.props;

    return (
      <div className="d-flex justify-content-between">
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
        <div className="dropdown">
          <button className="btn btn-default btn-xs dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            Dropdown
            <span className="caret"></span>
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
            <li><a href="#">Action</a></li>
            <li><a href="#">Another action</a></li>
            <li><a href="#">Something else here</a></li>
            <li role="separator" className="divider"></li>
            <li><a href="#">Separated link</a></li>
          </ul>
        </div>
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

  onChange: PropTypes.func,
};
