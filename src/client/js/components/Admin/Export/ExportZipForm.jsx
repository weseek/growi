import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExportZipForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      collections: new Set(),
    };

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.export = this.export.bind(this);
  }

  toggleCheckbox(e) {
    const { target } = e;
    const { name, checked } = target;

    this.setState((prevState) => {
      const collections = new Set(prevState.collections);
      if (checked) {
        collections.add(name);
      }
      else {
        collections.delete(name);
      }

      return { collections };
    });
  }

  async export(e) {
    e.preventDefault();

    // TODO use appContainer.apiv3.post
    const { zipFileStat } = await this.props.appContainer.apiPost('/v3/export', { collections: Array.from(this.state.collections) });
    // TODO toastSuccess, toastError
    this.props.addZipFileStat(zipFileStat);
  }

  render() {
    // const { t } = this.props;
    const collections = ['pages', 'revisions'];

    return (
      <form className="my-5" onSubmit={this.export}>
        {collections.map((collectionName) => {
          return (
            <div className="checkbox checkbox-info" key={collectionName}>
              <input
                type="checkbox"
                id={collectionName}
                name={collectionName}
                className="form-check-input"
                value={collectionName}
                checked={this.state.collections.has(collectionName)}
                onChange={this.toggleCheckbox}
              />
              <label className="form-check-label ml-3" htmlFor={collectionName}>
                {collectionName}
              </label>
            </div>
          );
        })}
        <button type="submit" className="btn btn-sm btn-default">Export</button>
      </form>
    );
  }

}

ExportZipForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  zipFileStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  addZipFileStat: PropTypes.func.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ExportZipFormWrapper = (props) => {
  return createSubscribedElement(ExportZipForm, props, [AppContainer]);
};

export default withTranslation()(ExportZipFormWrapper);
