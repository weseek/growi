import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as toastr from 'toastr';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import WebsocketContainer from '../../../services/WebsocketContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import GrowiZipImportOption from '../../../models/GrowiZipImportOption';

import GrowiZipImportItem, { DEFAULT_MODE } from './GrowiZipImportItem';


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
      isImporting: false,
      isImported: false,
      progressMap: [],
      errorsMap: [],

      collectionNameToFileNameMap: {},
      selectedCollections: new Set(),
      optionsMap: {},

      canImport: false,
      errorsForPageGroups: [],
      errorsForUserGroups: [],
      errorsForConfigGroups: [],
      errorsForOtherGroups: [],
    };

    this.props.innerFileStats.forEach((fileStat) => {
      const { fileName, collectionName } = fileStat;
      this.initialState.collectionNameToFileNameMap[collectionName] = fileName;
      this.initialState.optionsMap[collectionName] = new GrowiZipImportOption(DEFAULT_MODE);
    });

    this.state = this.initialState;

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.checkAll = this.checkAll.bind(this);
    this.uncheckAll = this.uncheckAll.bind(this);
    this.updateOption = this.updateOption.bind(this);
    this.validate = this.validate.bind(this);
    this.import = this.import.bind(this);
  }

  get allCollectionNames() {
    return Object.keys(this.state.collectionNameToFileNameMap);
  }

  componentWillMount() {
    this.setupWebsocketEventHandler();
  }

  setupWebsocketEventHandler() {
    const socket = this.props.websocketContainer.getWebSocket();

    // websocket event
    // eslint-disable-next-line object-curly-newline
    socket.on('admin:onProgressForImport', ({ collectionName, collectionProgress, appendedErrors }) => {
      console.log('onProgressForImport');

      const { progressMap, errorsMap } = this.state;
      progressMap[collectionName] = collectionProgress;

      const errors = errorsMap[collectionName] || [];
      errorsMap[collectionName] = errors.concat(appendedErrors);

      this.setState({
        isImporting: true,
        progressMap,
        errorsMap,
      });
    });

    // websocket event
    socket.on('admin:onTerminateForImport', () => {
      console.log('onTerminateForImport');

      this.setState({
        isImporting: false,
        isImported: true,
      });

      toastSuccess(undefined, 'Import process has terminated.');
    });
  }

  async toggleCheckbox(collectionName, bool) {
    const selectedCollections = new Set(this.state.selectedCollections);
    if (bool) {
      selectedCollections.add(collectionName);
    }
    else {
      selectedCollections.delete(collectionName);
    }

    await this.setState({ selectedCollections });

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

  updateOption(collectionName, option) {
    const newOptionsMap = { ...this.state.optionsMap };
    newOptionsMap[collectionName] = option;
    this.setState({ optionsMap: newOptionsMap });
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
    const { appContainer, fileName, onPostImport } = this.props;
    const { selectedCollections, optionsMap } = this.state;

    try {
      // TODO: use appContainer.apiv3.post
      await appContainer.apiv3Post('/import', {
        fileName,
        collections: Array.from(selectedCollections),
        optionsMap,
      });

      if (onPostImport != null) {
        onPostImport();
      }

      // TODO: toastSuccess, toastError
      toastr.success(undefined, 'Export process has requested.', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '1200',
        extendedTimeOut: '150',
      });
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

  renderGroups(groupList, groupName, errors, { wellContent } = {}) {
    const collectionNames = groupList.filter((collectionName) => {
      return this.allCollectionNames.includes(collectionName);
    });

    if (collectionNames.length === 0) {
      return null;
    }

    return (
      <div className="mt-4">
        <legend>{groupName} Collections</legend>
        { wellContent != null && (
          <div className="well well-sm small">
            <ul>
              <li>{wellContent}</li>
            </ul>
          </div>
        ) }
        { this.renderImportItems(collectionNames) }
        { this.renderWarnForGroups(errors, `warnFor${groupName}`) }
      </div>
    );
  }

  renderOthers() {
    const collectionNames = this.allCollectionNames.filter((collectionName) => {
      return !ALL_GROUPED_COLLECTIONS.includes(collectionName);
    });

    return this.renderGroups(collectionNames, 'Other', this.state.errorsForOtherGroups);
  }

  renderImportItems(collectionNames) {
    const {
      isImporting,
      isImported,
      progressMap,
      errorsMap,

      selectedCollections,
      optionsMap,
    } = this.state;

    return (
      <div className="row">
        {collectionNames.map((collectionName) => {
          const collectionProgress = progressMap[collectionName] || {};
          const errors = errorsMap[collectionName] || [];

          return (
            <div className="col-xs-6 my-1" key={collectionName}>
              <GrowiZipImportItem
                isImporting={isImporting}
                isImported={isImported}
                insertedCount={collectionProgress.insertedCount}
                modifiedCount={collectionProgress.modifiedCount}
                errorsCount={errors.length}

                collectionName={collectionName}
                isSelected={selectedCollections.has(collectionName)}
                option={optionsMap[collectionName]}
                onChange={this.toggleCheckbox}
                onOptionChange={this.updateOption}
              />
            </div>
          );
        })}
      </div>
    );
  }


  render() {
    const { t } = this.props;
    const { errorsForPageGroups, errorsForUserGroups, errorsForConfigGroups } = this.state;

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

        { this.renderGroups(GROUPS_PAGE, 'Page', errorsForPageGroups, { wellContent: t('importer_management.growi_settings.overwrite_documents') }) }
        { this.renderGroups(GROUPS_USER, 'User', errorsForUserGroups) }
        { this.renderGroups(GROUPS_CONFIG, 'Config', errorsForConfigGroups) }
        { this.renderOthers() }

        <div className="mt-4 text-center">
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
  websocketContainer: PropTypes.instanceOf(WebsocketContainer).isRequired,

  fileName: PropTypes.string,
  innerFileStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDiscard: PropTypes.func.isRequired,
  onPostImport: PropTypes.func,
};

/**
 * Wrapper component for using unstated
 */
const GrowiImportFormWrapper = (props) => {
  return createSubscribedElement(GrowiImportForm, props, [AppContainer, WebsocketContainer]);
};

export default withTranslation()(GrowiImportFormWrapper);
