import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { Waypoint } from 'react-waypoint';

import { withUnstatedContainers } from '../UnstatedUtils';
import GrowiRenderer from '~/client/util/GrowiRenderer';
import AppContainer from '~/client/services/AppContainer';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './RevisionRenderer';

/**
 * Load data from server and render RevisionBody component
 */
class LegacyRevisionLoader extends React.Component {

  constructor(props) {
    super(props);
    this.logger = loggerFactory('growi:Page:RevisionLoader');

    this.state = {
      markdown: '',
      isLoading: false,
      isLoaded: false,
      error: null,
      isForbidden: null,
    };

    this.loadData = this.loadData.bind(this);
    this.onWaypointChange = this.onWaypointChange.bind(this);
  }

  componentWillMount() {
    if (!this.props.lazy) {
      this.loadData();
    }
  }

  async loadData() {
    if (!this.state.isLoaded && !this.state.isLoading) {
      this.setState({ isLoading: true });
    }

    const { pageId, revisionId } = this.props;


    // load data with REST API
    try {
      const res = await this.props.appContainer.apiv3Get(`/revisions/${revisionId}`, { pageId });

      this.setState({
        markdown: res.data?.revision?.body,
        error: null,
        isForbidden: res.data.isForbidden,
      });

      if (this.props.onRevisionLoaded != null) {
        this.props.onRevisionLoaded(res.data.revision);
      }
    }
    catch (error) {
      this.setState({ error });
    }
    finally {
      this.setState({ isLoaded: true, isLoading: false });
    }

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
      markdown = `<i class="icon-exclamation p-1"></i><span class="text-muted"><em>${this.state.error.message}</em></span>`;
    }
    else if (this.state.isForbidden) {
      markdown = `<i class="icon-exclamation p-1"></i>${this.props.t('not_allowed_to_see_this_page')}`;
    }

    return (
      <RevisionRenderer
        growiRenderer={this.props.growiRenderer}
        markdown={markdown}
        highlightKeywords={this.props.highlightKeywords}
      />
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LegacyRevisionLoaderWrapper = withTranslation()(withUnstatedContainers(LegacyRevisionLoader, [AppContainer]));

LegacyRevisionLoader.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  t: PropTypes.func.isRequired,

  growiRenderer: PropTypes.instanceOf(GrowiRenderer).isRequired,
  pageId: PropTypes.string.isRequired,
  revisionId: PropTypes.string.isRequired,
  lazy: PropTypes.bool,
  onRevisionLoaded: PropTypes.func,
  highlightKeywords: PropTypes.arrayOf(PropTypes.string),
};

const RevisionLoader = (props) => {
  return <LegacyRevisionLoaderWrapper {...props}></LegacyRevisionLoaderWrapper>;
};
export default RevisionLoader;
