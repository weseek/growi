import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as toastr from 'toastr';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

const GROUPS_PAGE = [
  'pages', 'revisions', 'tags', 'pagetagrelations',
];
const GROUPS_USER = [
  'users', 'externalaccounts', 'usergroups', 'usergrouprelations',
];
const GROUPS_CONFIG = [
  'configs', 'updateposts', 'globalnotificationsettings',
];
const ALL_GROUPED_COLLECTIONS = GROUPS_PAGE.concat(GROUPS_USER).concat(GROUPS_CONFIG);


class GrowiImportForm extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {
      collectionNameToFileNameMap: {},
      selectedCollections: new Set(),
      schema: {
        pages: {},
        revisions: {},
        // ...
      },

      canImport: false,
      errorsForPageGroups: [],
      errorsForUserGroups: [],
      errorsForConfigGroups: [],
      errorsForOtherGroups: [],
    };

    this.props.fileStats.forEach((fileStat) => {
      const { fileName, collectionName } = fileStat;
      this.initialState.collectionNameToFileNameMap[collectionName] = fileName;
    });

    this.state = this.initialState;

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.checkAll = this.checkAll.bind(this);
    this.uncheckAll = this.uncheckAll.bind(this);
    this.validate = this.validate.bind(this);
    this.import = this.import.bind(this);
  }

  get allCollectionNames() {
    return Object.keys(this.state.collectionNameToFileNameMap);
  }

  async toggleCheckbox(e) {
    const { target } = e;
    const { name, checked } = target;

    await this.setState((prevState) => {
      const selectedCollections = new Set(prevState.selectedCollections);
      if (checked) {
        selectedCollections.add(name);
      }
      else {
        selectedCollections.delete(name);
      }
      return { selectedCollections };
    });

    this.validate();
  }

  async checkAll() {
    await this.setState({ selectedCollections: new Set(this.allCollectionNames) });
    this.validate();
  }

  async uncheckAll() {
    await this.setState({ selectedCollections: new Set() });
    this.validate();
  }

  async validate() {
    // init errors
    await this.setState({
      errorsForPageGroups: [],
      errorsForUserGroups: [],
      errorsForConfigGroups: [],
      errorsForOtherGroups: [],
    });

    await this.validateCollectionSize();
    await this.validatePagesCollectionPairs();
    await this.validateExternalAccounts();
    await this.validateUserGroups();
    await this.validateUserGroupRelations();

    const errors = [
      ...this.state.errorsForPageGroups,
      ...this.state.errorsForUserGroups,
      ...this.state.errorsForConfigGroups,
      ...this.state.errorsForOtherGroups,
    ];
    const canImport = errors.length === 0;

    this.setState({ canImport });
  }

  async validateCollectionSize(validationErrors) {
    const { t } = this.props;
    const { errorsForOtherGroups, selectedCollections } = this.state;

    if (selectedCollections.size === 0) {
      errorsForOtherGroups.push(t('importer_management.growi_settings.errors.at_least_one'));
    }

    this.setState({ errorsForOtherGroups });
  }

  async validatePagesCollectionPairs() {
    const { t } = this.props;
    const { errorsForPageGroups, selectedCollections } = this.state;

    const pageRelatedCollectionsLength = ['pages', 'revisions'].filter((collectionName) => {
      return selectedCollections.has(collectionName);
    }).length;

    // MUST be included both or neither when importing
    if (pageRelatedCollectionsLength !== 0 && pageRelatedCollectionsLength !== 2) {
      errorsForPageGroups.push(t('importer_management.growi_settings.errors.page_and_revision'));
    }

    this.setState({ errorsForPageGroups });
  }

  async validateExternalAccounts() {
    const { t } = this.props;
    const { errorsForUserGroups, selectedCollections } = this.state;

    // MUST include also 'users' if 'externalaccounts' is selected
    if (selectedCollections.has('externalaccounts')) {
      if (!selectedCollections.has('users')) {
        errorsForUserGroups.push(t('importer_management.growi_settings.errors.depends', { target: 'Users', condition: 'Externalaccounts' }));
      }
    }

    this.setState({ errorsForUserGroups });
  }

  async validateUserGroups() {
    const { t } = this.props;
    const { errorsForUserGroups, selectedCollections } = this.state;

    // MUST include also 'users' if 'usergroups' is selected
    if (selectedCollections.has('usergroups')) {
      if (!selectedCollections.has('users')) {
        errorsForUserGroups.push(t('importer_management.growi_settings.errors.depends', { target: 'Users', condition: 'Usergroups' }));
      }
    }

    this.setState({ errorsForUserGroups });
  }

  async validateUserGroupRelations() {
    const { t } = this.props;
    const { errorsForUserGroups, selectedCollections } = this.state;

    // MUST include also 'usergroups' if 'usergrouprelations' is selected
    if (selectedCollections.has('usergrouprelations')) {
      if (!selectedCollections.has('usergroups')) {
        errorsForUserGroups.push(t('importer_management.growi_settings.errors.depends', { target: 'Usergroups', condition: 'Usergrouprelations' }));
      }
    }

    this.setState({ errorsForUserGroups });
  }

  async import() {
    try {
      // TODO: use appContainer.apiv3.post
      const { results } = await this.props.appContainer.apiPost('/v3/import', {
        fileName: this.props.fileName,
        collections: Array.from(this.state.selectedCollections),
        schema: this.state.schema,
      });

      this.setState(this.initialState);
      this.props.onPostImport();

      // TODO: toastSuccess, toastError
      toastr.success(undefined, 'Imported documents', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '1200',
        extendedTimeOut: '150',
      });

      for (const { collectionName, failedIds } of results) {
        if (failedIds.length > 0) {
          toastr.error(`failed to insert ${failedIds.join(', ')}`, collectionName, {
            closeButton: true,
            progressBar: true,
            newestOnTop: false,
            timeOut: '30000',
          });
        }
      }
    }
    catch (err) {
      // TODO: toastSuccess, toastError
      toastr.error(err, 'Error', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '3000',
      });
    }
  }

  renderWarnForGroups(errors, key) {
    if (errors.length === 0) {
      return null;
    }

    return (
      <div key={key} className="alert alert-warning">
        <ul>
          { errors.map((error, index) => {
            // eslint-disable-next-line react/no-array-index-key
            return <li key={`${key}-${index}`}>{error}</li>;
          }) }
        </ul>
      </div>
    );
  }

  renderGroups(groupList, color) {
    const collectionNames = groupList.filter((collectionName) => {
      return this.allCollectionNames.includes(collectionName);
    });

    return this.renderCheckboxes(collectionNames, color);
  }

  renderOthers() {
    const collectionNames = this.allCollectionNames.filter((collectionName) => {
      return !ALL_GROUPED_COLLECTIONS.includes(collectionName);
    });

    return this.renderCheckboxes(collectionNames);
  }

  renderCheckboxes(collectionNames, color) {
    const checkboxColor = color ? `checkbox-${color}` : 'checkbox-info';

    return (
      <div className={`row checkbox ${checkboxColor}`}>
        {collectionNames.map((collectionName) => {
          return (
            <div className="col-xs-6 my-1" key={collectionName}>
              <input
                type="checkbox"
                id={collectionName}
                name={collectionName}
                className="form-check-input"
                value={collectionName}
                checked={this.state.selectedCollections.has(collectionName)}
                onChange={this.toggleCheckbox}
              />
              <label className="text-capitalize form-check-label ml-3" htmlFor={collectionName}>
                {collectionName}
              </label>
            </div>
          );
        })}
      </div>
    );
  }


  render() {
    const { t } = this.props;

    return (
      <>
        <form className="form-inline">
          <div className="form-group">
            <button type="button" className="btn btn-sm btn-default mr-2" onClick={this.checkAll}>
              <i className="fa fa-check-square-o"></i> {t('export_management.check_all')}
            </button>
          </div>
          <div className="form-group">
            <button type="button" className="btn btn-sm btn-default mr-2" onClick={this.uncheckAll}>
              <i className="fa fa-square-o"></i> {t('export_management.uncheck_all')}
            </button>
          </div>
        </form>

        <div className="mt-4">
          <legend>Page Collections</legend>
          <div className="well well-sm small">
            <ul>
              <li>{t('importer_management.growi_settings.overwrite_documents')}</li>
            </ul>
          </div>
          { this.renderGroups(GROUPS_PAGE) }
          { this.renderWarnForGroups(this.state.errorsForPageGroups, 'warnPageGroups') }
        </div>
        <div className="mt-4">
          <legend>User Collections</legend>
          { this.renderGroups(GROUPS_USER) }
          { this.renderWarnForGroups(this.state.errorsForUserGroups, 'warnUserGroups') }
        </div>
        <div className="mt-4">
          <legend>Config Collections</legend>
          { this.renderGroups(GROUPS_CONFIG) }
          { this.renderWarnForGroups(this.state.errorsForConfigGroups, 'warnConfigGroups') }
        </div>
        <div className="mt-4">
          <legend>Other Collections</legend>
          { this.renderOthers() }
          { this.renderWarnForGroups(this.state.errorsForOtherGroups, 'warnOtherGroups') }
        </div>

        <div className="mt-5 text-center">
          <button type="button" className="btn btn-default mx-1" onClick={this.props.onDiscard}>
            { t('importer_management.growi_settings.discard') }
          </button>
          <button type="button" className="btn btn-primary mx-1" onClick={this.import} disabled={!this.state.canImport}>
            { t('importer_management.import') }
          </button>
        </div>
      </>
    );
  }

}

GrowiImportForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  fileName: PropTypes.string,
  fileStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDiscard: PropTypes.func.isRequired,
  onPostImport: PropTypes.func.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const GrowiImportFormWrapper = (props) => {
  return createSubscribedElement(GrowiImportForm, props, [AppContainer]);
};

export default withTranslation()(GrowiImportFormWrapper);
