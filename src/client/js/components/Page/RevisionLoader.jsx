import React from 'react';
import PropTypes from 'prop-types';

import VisibilitySensor from 'react-visibility-sensor';

import RevisionRenderer from './RevisionRenderer';

/**
 * Load data from server and render RevisionBody component
 */
export default class RevisionLoader extends React.Component {

  constructor(props) {
    super(props);
    this.logger = require('@alias/logger')('growi:Page:RevisionLoader');

    this.state = {
      markdown: '',
      isLoading: false,
      isLoaded: false,
      error: null,
    };

    this.loadData = this.loadData.bind(this);
    this.onVisibilityChanged = this.onVisibilityChanged.bind(this);
  }

  loadData() {
    if (!this.state.isLoaded && !this.state.isLoading) {
      this.setState({ isLoading: true });
    }

    const requestData = {
      page_id: this.props.pageId,
      revision_id: this.props.revisionId,
    };

    // load data with REST API
    this.props.crowi.apiGet('/revisions.get', requestData)
      .then(res => {
        if (!res.ok) {
          throw new Error(res.error);
        }

        this.setState({
          markdown: res.revision.body,
          error: null,
        });
      })
      .catch(err => {
        this.setState({ error: err });
      })
      .finally(() => {
        this.setState({ isLoaded: true, isLoading: false });
      });
  }

  onVisibilityChanged(isVisible) {
    this.logger.info(this.props.pagePath, isVisible);

    if (!isVisible) {
      return;
    }

    this.loadData();
  }

  render() {
    // ----- before load -----
    if (!this.state.isLoaded) {
      return <VisibilitySensor onChange={this.onVisibilityChanged} delayedCall={true}>
        <div className="wiki"></div>
      </VisibilitySensor>;
    }

    // ----- loading -----
    if (!this.state.isLoaded) {
      return (
        <div className="wiki">
          <div className="text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        </div>
      );
    }

    // ----- after load -----
    let markdown = this.state.markdown;
    if (this.state.error != null) {
      markdown = `<span class="text-muted"><em>${this.state.error}</em></span>`;
    }

    return (
      <RevisionRenderer
          crowi={this.props.crowi} crowiRenderer={this.props.crowiRenderer}
          pagePath={this.props.pagePath}
          markdown={markdown}
          highlightKeywords={this.props.highlightKeywords}
      />
    );
  }
}

RevisionLoader.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiRenderer: PropTypes.object.isRequired,
  pageId: PropTypes.string.isRequired,
  pagePath: PropTypes.string.isRequired,
  revisionId: PropTypes.string.isRequired,
  lazy: PropTypes.bool.isRequired,
  highlightKeywords: PropTypes.string,
};
