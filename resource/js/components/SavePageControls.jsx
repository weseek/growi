import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import SlackNotification from './SlackNotification';
import GrantSelector from './SavePageControls/GrantSelector';

class SavePageControls extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      pageId: this.props.pageId,
    };
  }

  componentWillMount() {
  }

  /**
   * update pageId of state
   * @param {string} pageId
   */
  setPageId(pageId) {
    this.setState({pageId});
  }

  render() {
    const { t } = this.props;

    const label = this.state.pageId == null ? t('Create') : t('Update');

    return (
      <div className="d-flex align-items-center form-inline">
        <div className="mr-2">
          <SlackNotification
            crowi={this.props.crowi}
            pageId={this.props.pageId}
            pagePath={this.props.pagePath}
            isSlackEnabled={false}
            slackChannels={this.props.slackChannels}
            formName='pageForm' />
        </div>

        <div className="mr-2">
          <GrantSelector crowi={this.props.crowi}
            pageGrant={this.props.pageGrant}
            pageGrantGroupId={this.props.pageGrantGroupId}
            pageGrantGroupName={this.props.pageGrantGroupName} />
        </div>

        <button className="btn btn-primary btn-submit">{label}</button>
      </div>
    );
  }
}

SavePageControls.propTypes = {
  t: PropTypes.func.isRequired,               // i18next
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  // for SlackNotification
  pagePath: PropTypes.string,
  slackChannels: PropTypes.string,
  // for GrantSelector
  pageGrant: PropTypes.number,
  pageGrantGroupId: PropTypes.string,
  pageGrantGroupName: PropTypes.string,
};

export default translate()(SavePageControls);
