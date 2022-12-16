import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import PageContainer from '~/client/services/PageContainer';
import { apiGet } from '~/client/util/apiv1-client';

import PaginationWrapper from '../PaginationWrapper';
import { withUnstatedContainers } from '../UnstatedUtils';

import { Draft } from './Draft';

class MyDraftList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      drafts: [],
      currentDrafts: [],
      activePage: 1,
      totalDrafts: 0,
      pagingLimit: Infinity,
    };

    this.handlePage = this.handlePage.bind(this);
    this.getDraftsFromLocalStorage = this.getDraftsFromLocalStorage.bind(this);
    this.getCurrentDrafts = this.getCurrentDrafts.bind(this);
    this.clearDraft = this.clearDraft.bind(this);
    this.clearAllDrafts = this.clearAllDrafts.bind(this);
  }

  async UNSAFE_componentWillMount() {
    await this.getDraftsFromLocalStorage();
    this.getCurrentDrafts(1);
  }

  async handlePage(selectedPage) {
    await this.getDraftsFromLocalStorage();
    await this.getCurrentDrafts(selectedPage);
  }

  async getDraftsFromLocalStorage() {
    const draftsAsObj = this.props.editorContainer.drafts;

    if (draftsAsObj == null) {
      return;
    }

    const res = await apiGet('/pages.exist', {
      pagePaths: JSON.stringify(Object.keys(draftsAsObj)),
    });

    // {'/a': '#a', '/b': '#b'} => [{path: '/a', markdown: '#a'}, {path: '/b', markdown: '#b'}]
    const drafts = Object.entries(draftsAsObj).map((d) => {
      const path = d[0];
      return {
        path,
        markdown: d[1],
        isExist: res.pages[path],
      };
    });

    this.setState({ drafts, totalDrafts: drafts.length });
  }

  getCurrentDrafts(selectPageNumber) {

    const limit = 50; // implement only this component.(this default value is 50 (pageLimitationL))

    const totalDrafts = this.state.drafts.length;
    const activePage = selectPageNumber;

    const currentDrafts = this.state.drafts.slice((activePage - 1) * limit, activePage * limit);

    this.setState({
      currentDrafts,
      activePage,
      totalDrafts,
      pagingLimit: limit,
    });
  }

  /**
   * generate Elements of Draft
   *
   * @param {any} drafts Array of pages Model Obj
   *
   */
  generateDraftList(drafts) {
    return drafts.map((draft, index) => {
      return (
        <Draft
          index={index}
          key={draft.path}
          path={draft.path}
          markdown={draft.markdown}
          isExist={draft.isExist}
          clearDraft={this.clearDraft}
        />
      );
    });
  }

  clearDraft(path) {
    // this.props.editorContainer.clearDraft(path);

    this.setState((prevState) => {
      return {
        drafts: prevState.drafts.filter((draft) => { return draft.path !== path }),
        currentDrafts: prevState.drafts.filter((draft) => { return draft.path !== path }),
      };
    });
  }

  clearAllDrafts() {
    // this.props.editorContainer.clearAllDrafts();

    this.setState({
      drafts: [],
      currentDrafts: [],
      activePage: 1,
      totalDrafts: 0,
      pagingLimit: Infinity,
    });
  }

  render() {
    const { t } = this.props;

    const draftList = this.generateDraftList(this.state.currentDrafts);
    const totalCount = this.state.totalDrafts;

    return (
      <div className="page-list-container-create ">
        { totalCount === 0
          && <span className="mt-2">No drafts yet.</span>
        }

        { totalCount > 0 && (
          <React.Fragment>
            <div className="d-flex justify-content-between mt-2">
              <h4>Total: {totalCount} drafts</h4>
              <div className="align-self-center">
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={this.clearAllDrafts}>
                  <i className="icon-fw icon-fire"></i>
                  {t('delete_all')}
                </button>
              </div>
            </div>

            <div className="tab-pane mt-2 accordion" id="draft-list">
              {draftList}
            </div>
            <PaginationWrapper
              activePage={this.state.activePage}
              changePage={this.handlePage}
              totalItemsCount={this.state.totalDrafts}
              pagingLimit={this.state.pagingLimit}
              align="center"
              size="sm"
            />
          </React.Fragment>
        ) }

      </div>
    );
  }

}

MyDraftList.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  // editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};

const MyDraftListWrapperFC = (props) => {
  const { t } = useTranslation();
  return <MyDraftList t={t} {...props} />;
};

export default MyDraftListWrapperFC;

/**
 * Wrapper component for using unstated
 */
// const MyDraftListWrapper = withUnstatedContainers(MyDraftListWrapperFC, [PageContainer, EditorContainer]);

// export default MyDraftListWrapper;
