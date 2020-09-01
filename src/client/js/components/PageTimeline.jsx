import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import { withUnstatedContainers } from './UnstatedUtils';

import RevisionLoader from './Page/RevisionLoader';


class PageTimeline extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;
    this.updatePages = this.updatePages.bind(this);
    this.state = {
      isEnabled: appContainer.getConfig().isEnabledTimeline,

      // TODO: remove after when timeline is implemented with React and inject data with props
      pages: this.props.pages,
    };

  }

  async updatePages() {
    const { appContainer, pageContainer } = this.props;
    const { path } = pageContainer.state;
    const res = await appContainer.apiv3Get('/pages/list', { path });
    this.setState({
      pages: res.data.pages,
    });
  }

  componentWillMount() {
    if (!this.state.isEnabled) {
      return;
    }
    const { appContainer } = this.props;

    // initialize GrowiRenderer
    this.growiRenderer = appContainer.getRenderer('timeline');
    this.updatePages();
  }

  render() {
    if (!this.state.isEnabled) {
      return <React.Fragment></React.Fragment>;
    }

    const { pages } = this.state;

    if (pages == null) {
      return <React.Fragment></React.Fragment>;
    }

    return pages.map((page) => {
      return (
        <div className="timeline-body" key={`key-${page.id}`}>
          <div className="card card-timeline">
            <div className="card-header"><a href={page.path}>{page.path}</a></div>
            <div className="card-body">
              <RevisionLoader
                lazy
                growiRenderer={this.growiRenderer}
                pageId={page.id}
                revisionId={page.revision}
              />
            </div>
          </div>
        </div>
      );
    });

  }

}

PageTimeline.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  pages: PropTypes.arrayOf(PropTypes.object),
};

/**
 * Wrapper component for using unstated
 */
const PageTimelineWrapper = withUnstatedContainers(PageTimeline, [AppContainer, PageContainer]);

export default withTranslation()(PageTimelineWrapper);
