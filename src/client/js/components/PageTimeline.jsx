import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import * as entities from 'entities';

import AppContainer from '../services/AppContainer';
import { createSubscribedElement } from './UnstatedUtils';

import RevisionLoader from './Page/RevisionLoader';


class PageTimeline extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;

    this.state = {
      isEnabled: appContainer.getConfig().isEnabledTimeline,
      isInitialized: false,

      // TODO: remove after when timeline is implemented with React and inject data with props
      pages: this.props.pages,
    };

  }

  componentWillMount() {
    if (!this.state.isEnabled) {
      return;
    }

    const { appContainer } = this.props;

    // initialize GrowiRenderer
    this.growiRenderer = appContainer.getRenderer('timeline');

    this.initBsTab();
  }

  /**
   * initialize Bootstrap Tab event for 'shown.bs.tab'
   * TODO: remove this method after implement with React
   */
  initBsTab() {
    $('a[data-toggle="tab"][href="#view-timeline"]').on('shown.bs.tab', () => {
      if (this.state.isInitialized) {
        return;
      }

      const pageIdsElm = document.getElementById('page-timeline-data');

      if (pageIdsElm == null || pageIdsElm.text.length === 0) {
        return;
      }

      const pages = this.extractDataFromDom();

      this.setState({
        isInitialized: true,
        pages,
      });
    });
  }

  /**
   * extract page data from DOM
   * TODO: remove this method after implement with React
   */
  extractDataFromDom() {
    const pageIdsElm = document.getElementById('page-timeline-data');

    if (pageIdsElm == null || pageIdsElm.text.length === 0) {
      return null;
    }

    let pages = JSON.parse(pageIdsElm.text);
    // decode path
    pages = pages.map((page) => {
      page.path = decodeURIComponent(entities.decodeHTML(page.path));
      return page;
    });

    return pages;
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
          <div className="panel panel-timeline">
            <div className="panel-heading"><a href={page.path}>{page.path}</a></div>
            <div className="panel-body">
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
  pages: PropTypes.arrayOf(PropTypes.object),
};

/**
 * Wrapper component for using unstated
 */
const PageTimelineWrapper = (props) => {
  return createSubscribedElement(PageTimeline, props, [AppContainer]);
};

export default withTranslation()(PageTimelineWrapper);
