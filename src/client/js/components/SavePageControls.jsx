import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import ButtonToolbar from 'react-bootstrap/es/ButtonToolbar';
import SplitButton from 'react-bootstrap/es/SplitButton';
import MenuItem from 'react-bootstrap/es/MenuItem';

import SlackNotification from './SlackNotification';
import GrantSelector from './SavePageControls/GrantSelector';

class SavePageControls extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      pageId: this.props.pageId,
    };

    this.getCurrentOptionsToSave = this.getCurrentOptionsToSave.bind(this);
    this.submit = this.submit.bind(this);
    this.submitAndOverwriteScopesOfDescendants = this.submitAndOverwriteScopesOfDescendants.bind(this);
  }

  componentWillMount() {
  }

  getCurrentOptionsToSave() {
    const slackNotificationOptions = this.slackNotification.getCurrentOptionsToSave();
    const grantSelectorOptions = this.grantSelector.getCurrentOptionsToSave();
    return Object.assign(slackNotificationOptions, grantSelectorOptions);
  }

  /**
   * update pageId of state
   * @param {string} pageId
   */
  setPageId(pageId) {
    this.setState({ pageId });
  }

  submit() {
    this.props.onSubmit();
  }

  submitAndOverwriteScopesOfDescendants() {
    this.props.onSubmit({ overwriteScopesOfDescendants: true });
  }

  render() {
    const { t } = this.props;

    const config = this.props.crowi.getConfig();
    const hasSlackConfig = config.hasSlackConfig;
    const isAclEnabled = config.isAclEnabled;
    const labelSubmitButton = this.state.pageId == null ? t('Create') : t('Update');
    const labelOverwriteScopes = t('page_edit.overwrite_scopes', { operation: labelSubmitButton });

    return (
      <div className="d-flex align-items-center form-inline">
        {hasSlackConfig
          && (
          <div className="mr-2">
            <SlackNotification
              ref={(c) => { this.slackNotification = c }}
              isSlackEnabled={false}
              slackChannels={this.props.slackChannels}
            />
          </div>
          )
        }

        {isAclEnabled
          && (
          <div className="mr-2">
            <GrantSelector
              crowi={this.props.crowi}
              ref={(elem) => {
                  if (this.grantSelector == null) {
                    this.grantSelector = elem.getWrappedInstance();
                  }
                }}
              grant={this.props.grant}
              grantGroupId={this.props.grantGroupId}
              grantGroupName={this.props.grantGroupName}
            />
          </div>
          )
        }

        <ButtonToolbar>
          <SplitButton
            id="spl-btn-submit"
            bsStyle="primary"
            className="btn-submit"
            dropup
            pullRight
            onClick={this.submit}
            title={labelSubmitButton}
          >
            <MenuItem eventKey="1" onClick={this.submitAndOverwriteScopesOfDescendants}>{labelOverwriteScopes}</MenuItem>
            {/* <MenuItem divider /> */}
          </SplitButton>
        </ButtonToolbar>
      </div>
    );
  }

}

SavePageControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  pageId: PropTypes.string,
  // for SlackNotification
  slackChannels: PropTypes.string,
  // for GrantSelector
  grant: PropTypes.number,
  grantGroupId: PropTypes.string,
  grantGroupName: PropTypes.string,
};

export default translate()(SavePageControls);
