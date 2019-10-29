import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as toastr from 'toastr';

import GrowiArchiveImportOption from '@commons/models/admin/growi-archive-import-option';
import ImportOptionForPages from '@commons/models/admin/import-option-for-pages';
import ImportOptionForRevisions from '@commons/models/admin/import-option-for-revisions';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import WebsocketContainer from '../../../services/WebsocketContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';


import GrowiZipImportItem, { DEFAULT_MODE, MODE_RESTRICTED_COLLECTION } from './GrowiZipImportItem';
import GrowiZipImportConfigurationModal from './GrowiZipImportConfigurationModal';
import ErrorViewer from './ErrorViewer';


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

const IMPORT_OPTION_CLASS_MAPPING = {
  pages: ImportOptionForPages,
  revisions: ImportOptionForRevisions,
};

class GrowiImportForm extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {
      isImporting: false,
      isImported: false,
      progressMap: [],
      errorsMap: [],

      selectedCollections: new Set(),

      // store relations from collection name to file name
      collectionNameToFileNameMap: {},
      // store relations from collection name to GrowiArchiveImportOption instance
      optionsMap: {},

      isConfigurationModalOpen: false,
      collectionNameForConfiguration: null,

      isErrorsViewerOpen: false,
      collectionNameForErrorsViewer: null,

      canImport: false,
      warnForPageGroups: [],
      warnForUserGroups: [],
      warnForConfigGroups: [],
      warnForOtherGroups: [],
    };

    this.props.innerFileStats.forEach((fileStat) => {
      const { fileName, collectionName } = fileStat;
      this.initialState.collectionNameToFileNameMap[collectionName] = fileName;

      // determine initial mode
      const initialMode = (MODE_RESTRICTED_COLLECTION[collectionName] != null)
        ? MODE_RESTRICTED_COLLECTION[collectionName][0]
        : DEFAULT_MODE;
      // create GrowiArchiveImportOption instance
      const ImportOption = IMPORT_OPTION_CLASS_MAPPING[collectionName] || GrowiArchiveImportOption;
      this.initialState.optionsMap[collectionName] = new ImportOption(initialMode);
    });

    this.state = this.initialState;

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.checkAll = this.checkAll.bind(this);
    this.uncheckAll = this.uncheckAll.bind(this);
    this.updateOption = this.updateOption.bind(this);
    this.openConfigurationModal = this.openConfigurationModal.bind(this);
    this.showErrorsViewer = this.showErrorsViewer.bind(this);
    this.validate = this.validate.bind(this);
    this.import = this.import.bind(this);
  }

  get allCollectionNames() {
    return Object.keys(this.state.collectionNameToFileNameMap);
  }

  componentWillMount() {
    this.setupWebsocketEventHandler();
  }

  componentWillUnmount() {
    this.teardownWebsocketEventHandler();
  }

  setupWebsocketEventHandler() {
    const socket = this.props.websocketContainer.getWebSocket();

    // websocket event
    // eslint-disable-next-line object-curly-newline
    socket.on('admin:onProgressForImport', ({ collectionName, collectionProgress, appendedErrors }) => {
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
      this.setState({
        isImporting: false,
        isImported: true,
      });

      toastSuccess(undefined, 'Import process has terminated.');
    });
  }

  teardownWebsocketEventHandler() {
    const socket = this.props.websocketContainer.getWebSocket();

    socket.removeAllListeners('admin:onProgressForImport');
    socket.removeAllListeners('admin:onTerminateForImport');
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

  updateOption(collectionName, data) {
    const { optionsMap } = this.state;
    const options = optionsMap[collectionName];

    // merge
    Object.assign(options, data);

    optionsMap[collectionName] = options;
    this.setState({ optionsMap });
  }

  openConfigurationModal(collectionName) {
    this.setState({ isConfigurationModalOpen: true, collectionNameForConfiguration: collectionName });
  }

  showErrorsViewer(collectionName) {
    this.setState({ isErrorsViewerOpen: true, collectionNameForErrorsViewer: collectionName });
  }

  async validate() {
    // init errors
    await this.setState({
      warnForPageGroups: [],
      warnForUserGroups: [],
      warnForConfigGroups: [],
      warnForOtherGroups: [],
    });

    await this.validateCollectionSize();
    await this.validatePagesCollectionPairs();
    await this.validateExternalAccounts();
    await this.validateUserGroups();
    await this.validateUserGroupRelations();

    const errors = [
      ...this.state.warnForPageGroups,
      ...this.state.warnForUserGroups,
      ...this.state.warnForConfigGroups,
      ...this.state.warnForOtherGroups,
    ];
    const canImport = errors.length === 0;

    this.setState({ canImport });
  }

  async validateCollectionSize(validationErrors) {
    const { t } = this.props;
    const { warnForOtherGroups, selectedCollections } = this.state;

    if (selectedCollections.size === 0) {
      warnForOtherGroups.push(t('importer_management.growi_settings.errors.at_least_one'));
    }

    this.setState({ warnForOtherGroups });
  }

  async validatePagesCollectionPairs() {
    const { t } = this.props;
    const { warnForPageGroups, selectedCollections } = this.state;

    const pageRelatedCollectionsLength = ['pages', 'revisions'].filter((collectionName) => {
      return selectedCollections.has(collectionName);
    }).length;

    // MUST be included both or neither when importing
    if (pageRelatedCollectionsLength !== 0 && pageRelatedCollectionsLength !== 2) {
      warnForPageGroups.push(t('importer_management.growi_settings.errors.page_and_revision'));
    }

    this.setState({ warnForPageGroups });
  }

  async validateExternalAccounts() {
    const { t } = this.props;
    const { warnForUserGroups, selectedCollections } = this.state;

    // MUST include also 'users' if 'externalaccounts' is selected
    if (selectedCollections.has('externalaccounts')) {
      if (!selectedCollections.has('users')) {
        warnForUserGroups.push(t('importer_management.growi_settings.errors.depends', { target: 'Users', condition: 'Externalaccounts' }));
      }
    }

    this.setState({ warnForUserGroups });
  }

  async validateUserGroups() {
    const { t } = this.props;
    const { warnForUserGroups, selectedCollections } = this.state;

    // MUST include also 'users' if 'usergroups' is selected
    if (selectedCollections.has('usergroups')) {
      if (!selectedCollections.has('users')) {
        warnForUserGroups.push(t('importer_management.growi_settings.errors.depends', { target: 'Users', condition: 'Usergroups' }));
      }
    }

    this.setState({ warnForUserGroups });
  }

  async validateUserGroupRelations() {
    const { t } = this.props;
    const { warnForUserGroups, selectedCollections } = this.state;

    // MUST include also 'usergroups' if 'usergrouprelations' is selected
    if (selectedCollections.has('usergrouprelations')) {
      if (!selectedCollections.has('usergroups')) {
        warnForUserGroups.push(t('importer_management.growi_settings.errors.depends', { target: 'Usergroups', condition: 'Usergrouprelations' }));
      }
    }

    this.setState({ warnForUserGroups });
  }

  async import() {
    const { appContainer, fileName, onPostImport } = this.props;
    const { selectedCollections, optionsMap } = this.state;

    // init progress data
    await this.setState({
      isImporting: true,
      progressMap: [],
      errorsMap: [],
    });

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

    return this.renderGroups(collectionNames, 'Other', this.state.warnForOtherGroups);
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
          const collectionProgress = progressMap[collectionName];
          const errors = errorsMap[collectionName];
          const isConfigButtonAvailable = Object.keys(IMPORT_OPTION_CLASS_MAPPING).includes(collectionName);

          return (
            <div className="col-xs-6 my-1" key={collectionName}>
              <GrowiZipImportItem
                isImporting={isImporting}
                isImported={collectionProgress ? isImported : false}
                insertedCount={collectionProgress ? collectionProgress.insertedCount : 0}
                modifiedCount={collectionProgress ? collectionProgress.modifiedCount : 0}
                errorsCount={errors ? errors.length : 0}

                collectionName={collectionName}
                isSelected={selectedCollections.has(collectionName)}
                option={optionsMap[collectionName]}

                isConfigButtonAvailable={isConfigButtonAvailable}

                onChange={this.toggleCheckbox}
                onOptionChange={this.updateOption}
                onConfigButtonClicked={this.openConfigurationModal}
                onErrorLinkClicked={this.showErrorsViewer}
              />
            </div>
          );
        })}
      </div>
    );
  }

  renderConfigurationModal() {
    const { isConfigurationModalOpen, collectionNameForConfiguration: collectionName, optionsMap } = this.state;

    if (collectionName == null) {
      return null;
    }

    return (
      <GrowiZipImportConfigurationModal
        isOpen={isConfigurationModalOpen}
        onClose={() => this.setState({ isConfigurationModalOpen: false })}
        onOptionChange={this.updateOption}
        collectionName={collectionName}
        option={optionsMap[collectionName]}
      />
    );
  }

  renderErrorsViewer() {
    const { isErrorsViewerOpen, errorsMap, collectionNameForErrorsViewer } = this.state;
    const errors = errorsMap[collectionNameForErrorsViewer];

    return (
      <ErrorViewer
        isOpen={isErrorsViewerOpen}
        onClose={() => this.setState({ isErrorsViewerOpen: false })}
        errors={errors}
      />
    );
  }

  render() {
    const { t } = this.props;
    const {
      canImport, isImporting,
      warnForPageGroups, warnForUserGroups, warnForConfigGroups,
    } = this.state;

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

        { this.renderGroups(GROUPS_PAGE, 'Page', warnForPageGroups, { wellContent: t('importer_management.growi_settings.overwrite_documents') }) }
        { this.renderGroups(GROUPS_USER, 'User', warnForUserGroups) }
        { this.renderGroups(GROUPS_CONFIG, 'Config', warnForConfigGroups) }
        { this.renderOthers() }

        <div className="mt-4 text-center">
          <button type="button" className="btn btn-default mx-1" onClick={this.props.onDiscard}>
            { t('importer_management.growi_settings.discard') }
          </button>
          <button type="button" className="btn btn-primary mx-1" onClick={this.import} disabled={!canImport || isImporting}>
            { t('importer_management.import') }
          </button>
        </div>

        { this.renderConfigurationModal() }
        { this.renderErrorsViewer() }
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
