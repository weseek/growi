import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from '~/i18n';
import { PaginationWrapper } from '~/components/PaginationWrapper';
import MarkdownRenderer from '~/service/renderer/markdown-renderer';
import { useTimelineRenderer } from '~/stores/renderer';

import { apiv3Get } from '../util/apiv3-client';

import PageContainer from '../services/PageContainer';
import { withUnstatedContainers } from './UnstatedUtils';

import RevisionLoader from './Page/RevisionLoader';


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
    const { pageContainer } = this.props;
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
            <div className="timeline-body" key={`key-${page.id}`}>
              <div className="card card-timeline">
                <div className="card-header"><a href={page.path}>{page.path}</a></div>
                <div className="card-body">
                  <RevisionLoader
                    lazy
                    renderer={this.props.renderer}
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
          totalItemsCount={this.state.totalPageItems}
          pagingLimit={this.state.limit}
          align="center"
        />
      </div>
    );

  }

}

/**
 * Wrapper component for using unstated
 */
const PageTimelineWrapper = withUnstatedContainers(PageTimeline, [PageContainer]);

PageTimeline.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  renderer: PropTypes.instanceOf(MarkdownRenderer).isRequired,
  pages: PropTypes.arrayOf(PropTypes.object),
};

const PageTimelineWrapperWrapper = (props) => {
  const { t } = useTranslation();
  const { data: renderer } = useTimelineRenderer();

  return <PageTimelineWrapper {...props} t={t} renderer={renderer} />;
};

export default PageTimelineWrapperWrapper;
