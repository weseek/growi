import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import * as toastr from 'toastr';

import SlackNotification from './SlackNotification';
import GrantSelector from './SavePageControls/GrantSelector';

class SavePageControls extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.apiErrorHandler = this.apiErrorHandler.bind(this);
  }

  componentWillMount() {
  }

  save() {
    const params = {
    };
    this.props.crowi.apiPost('/page.save', params)
      .then(res => {
        if (!res.ok) {
          throw new Error(res.error);
        }

      })
      .catch(this.apiErrorHandler)
      .then(() => {
      });
  }

  apiErrorHandler(error) {
    toastr.error(error.message, 'Error occured', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '3000',
    });
  }

  render() {
    const { t } = this.props;

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

        <button className="btn btn-primary btn-submit">{t('Save')}</button>
      </div>
    );
  }
}

SavePageControls.propTypes = {
  t: PropTypes.func.isRequired,               // i18next
  crowi: PropTypes.object.isRequired,
  // for SlackNotification
  pageId: PropTypes.string,
  pagePath: PropTypes.string,
  slackChannels: PropTypes.string,
  // for GrantSelector
  pageGrant: PropTypes.number,
  pageGrantGroupId: PropTypes.string,
  pageGrantGroupName: PropTypes.string,
};

export default translate()(SavePageControls);
