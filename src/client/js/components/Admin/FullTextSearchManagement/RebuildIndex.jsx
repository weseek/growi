import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import WebsocketContainer from '../../../services/WebsocketContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import ProgressBar from '../Common/ProgressBar';

class RebuildIndex extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isProcessing: false,
      isCompleted: false,

      total: 0,
      current: 0,
      skip: 0,
    };

    this.buildIndex = this.buildIndex.bind(this);
  }

  componentDidMount() {
    const socket = this.props.websocketContainer.getWebSocket();

    socket.on('admin:addPageProgress', (data) => {
      this.setState({
        isProcessing: true,
        ...data,
      });
    });

    socket.on('admin:finishAddPage', (data) => {
      this.setState({
        isProcessing: false,
        isCompleted: true,
        ...data,
      });
    });
  }

  async buildIndex() {

    const { appContainer } = this.props;
    const pageId = this.pageId;

    try {
      const res = await appContainer.apiPost('/admin/search/build', { page_id: pageId });
      if (!res.ok) {
        throw new Error(res.message);
      }

      this.setState({ isProcessing: true });
      toastSuccess('Rebuilding is requested');
    }
    catch (e) {
      toastError(e);
    }
  }

  renderProgressBar() {
    const {
      total, current, skip, isProcessing, isCompleted,
    } = this.state;
    const showProgressBar = isProcessing || isCompleted;

    if (!showProgressBar) {
      return null;
    }

    const header = isCompleted ? 'Completed' : `Processing.. (${skip} skips)`;

    return (
      <ProgressBar
        header={header}
        currentCount={current}
        totalCount={total}
      />
    );
  }

  render() {
    const { t } = this.props;

    return (
      <>
        <div className="row">
          <div className="col-xs-3 control-label"></div>
          <div className="col-xs-9">
            { this.renderProgressBar() }

            <button
              type="submit"
              className="btn btn-inverse"
              onClick={this.buildIndex}
              disabled={this.state.isProcessing}
            >
              { t('full_text_search_management.build_button') }
            </button>

            <p className="help-block">
              { t('full_text_search_management.rebuild_description_1') }<br />
              { t('full_text_search_management.rebuild_description_2') }<br />
              { t('full_text_search_management.rebuild_description_3') }<br />
            </p>
          </div>
        </div>
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const RebuildIndexWrapper = (props) => {
  return createSubscribedElement(RebuildIndex, props, [AppContainer, WebsocketContainer]);
};

RebuildIndex.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  websocketContainer: PropTypes.instanceOf(WebsocketContainer).isRequired,
};

export default withTranslation()(RebuildIndexWrapper);
