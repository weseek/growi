import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import PaginationWrapper from './PaginationWrapper';
import { withUnstatedContainers } from './UnstatedUtils';

import RevisionLoader from './Page/RevisionLoader';


class PageTimeline extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;
    this.showPages = this.showPages.bind(this);
    this.handlePage = this.handlePage.bind(this);
    this.state = {
      activePage: 1,
      totalPages: 0,
      limit: appContainer.getConfig().recentCreatedLimit,
      pages: [],
    };

  }

  async handlePage(selectedPage) {
    await this.showPages(selectedPage);
  }

  async showPages(selectedPage) {
    const { appContainer, pageContainer } = this.props;
    const { path } = pageContainer.state;
    const limit = this.state.limit;
    const offset = (selectedPage - 1) * limit;
    const res = await appContainer.apiv3Get('/pages/list', { path, limit, offset });
    const activePage = selectedPage;
    const totalPages = res.data.totalCount;
    const pages = res.data.pages;
    this.setState({
      activePage,
      totalPages,
      pages,
    });
  }

  componentWillMount() {
    const { appContainer } = this.props;

    // initialize GrowiRenderer
    this.growiRenderer = appContainer.getRenderer('timeline');
    this.showPages(1);
  }

  render() {
    const { pages } = this.state;

    if (pages == null) {
      return <React.Fragment></React.Fragment>;
    }

    return (
      <div>
        { pages.map((page) => {
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
        }) }
        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={this.state.totalPages}
          pagingLimit={this.state.limit}
        />
      </div>
    );

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
