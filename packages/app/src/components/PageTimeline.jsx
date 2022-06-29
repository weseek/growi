import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';
import { apiv3Get } from '~/client/util/apiv3-client';

import RevisionLoader from './Page/RevisionLoader';
import PaginationWrapper from './PaginationWrapper';
import { withUnstatedContainers } from './UnstatedUtils';


class PageTimeline extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activePage: 1,
      totalPageItems: 0,
      limit: null,

      // TODO: remove after when timeline is implemented with React and inject data with props
      pages: this.props.pages,
    };

    this.handlePage = this.handlePage.bind(this);
  }


  async handlePage(selectedPage) {
    const { appContainer, pageContainer } = this.props;
    const { path } = pageContainer.state;
    const page = selectedPage;

    const res = await apiv3Get('/pages/list', { path, page });
    const totalPageItems = res.data.totalCount;
    const pages = res.data.pages;
    const pagingLimit = res.data.limit;
    this.setState({
      activePage: selectedPage,
      totalPageItems,
      pages,
      limit: pagingLimit,
    });
  }

  UNSAFE_componentWillMount() {
    const { appContainer } = this.props;
    // initialize GrowiRenderer
    this.growiRenderer = appContainer.getRenderer('timeline');
  }

  async componentDidMount() {
    await this.handlePage(1);
    this.setState({
      activePage: 1,
    });
  }

  render() {
    const { t } = this.props;
    const { pages } = this.state;

    if (pages == null || pages.length === 0) {
      return (
        <div className="mt-2">
          {/* eslint-disable-next-line react/no-danger */}
          <p>{t('custom_navigation.no_page_list')}</p>
        </div>
      );
    }

    return (
      <div>
        { pages.map((page) => {
          return (
            <div className="timeline-body" key={`key-${page._id}`}>
              <div className="card card-timeline">
                <div className="card-header"><a href={page.path}>{page.path}</a></div>
                <div className="card-body">
                  <RevisionLoader
                    lazy
                    growiRenderer={this.growiRenderer}
                    pageId={page._id}
                    pagePath={page.path}
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
          totalItemsCount={this.state.totalPageItems}
          pagingLimit={this.state.limit}
          align="center"
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

const PageTimelineWrapperFC = (props) => {
  const { t } = useTranslation();
  return <PageTimeline t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const PageTimelineWrapper = withUnstatedContainers(PageTimelineWrapperFC, [AppContainer, PageContainer]);

export default PageTimelineWrapper;
