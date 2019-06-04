import React from 'react';
import PropTypes from 'prop-types';

import { Waypoint } from 'react-waypoint';

import { createSubscribedElement } from '../UnstatedUtils';
import GrowiRenderer from '../../util/GrowiRenderer';
import AppContainer from '../../services/AppContainer';

import RevisionRenderer from './RevisionRenderer';

/**
 * Load data from server and render RevisionBody component
 */
class RevisionLoader extends React.Component {

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
    this.onWaypointChange = this.onWaypointChange.bind(this);
  }

  componentWillMount() {
    if (!this.props.lazy) {
      this.loadData();
    }
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
    this.props.appContainer.apiGet('/revisions.get', requestData)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.error);
        }

        this.setState({
          markdown: res.revision.body,
          error: null,
        });
      })
      .catch((err) => {
        this.setState({ error: err });
      })
      .finally(() => {
        this.setState({ isLoaded: true, isLoading: false });
      });
  }

  onWaypointChange(event) {
    if (event.currentPosition === Waypoint.above || event.currentPosition === Waypoint.inside) {
      this.loadData();
    }
  }

  render() {
    // ----- before load -----
    if (this.props.lazy && !this.state.isLoaded) {
      return (
        <Waypoint onPositionChange={this.onWaypointChange} bottomOffset="-100px">
          <div className="wiki"></div>
        </Waypoint>
      );
    }

    // ----- loading -----
    if (this.state.isLoading) {
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
        growiRenderer={this.props.growiRenderer}
        pagePath={this.props.pagePath}
        markdown={markdown}
        highlightKeywords={this.props.highlightKeywords}
      />
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const RevisionLoaderWrapper = (props) => {
  return createSubscribedElement(RevisionLoader, props, [AppContainer]);
};

RevisionLoader.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  growiRenderer: PropTypes.instanceOf(GrowiRenderer).isRequired,
  pageId: PropTypes.string.isRequired,
  pagePath: PropTypes.string.isRequired,
  revisionId: PropTypes.string.isRequired,
  lazy: PropTypes.bool,
  highlightKeywords: PropTypes.string,
};

export default RevisionLoaderWrapper;
