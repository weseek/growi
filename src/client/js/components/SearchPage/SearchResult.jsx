import React from 'react';
import PropTypes from 'prop-types';
import * as toastr from 'toastr';

import Page from '../PageList/Page';
import SearchResultList from './SearchResultList';
import DeletePageListModal from './DeletePageListModal';
import AppContainer from '../../services/AppContainer';
import { createSubscribedElement } from '../UnstatedUtils';

class SearchResult extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      deletionMode: false,
      selectedPages: new Set(),
      isDeleteCompletely: undefined,
      isDeleteConfirmModalShown: false,
      errorMessageForDeleting: undefined,
    };
    this.toggleDeleteCompletely = this.toggleDeleteCompletely.bind(this);
    this.deleteSelectedPages = this.deleteSelectedPages.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
  }

  isNotSearchedYet() {
    return !this.props.searchResultMeta.took;
  }

  isNotFound() {
    return this.props.searchingKeyword !== '' && this.props.pages.length === 0;
  }

  isError() {
    if (this.props.searchError !== null) {
      return true;
    }
    return false;
  }

  /**
   * toggle checkbox and add (or delete from) selected pages list
   *
   * @param {any} page
   * @memberof SearchResult
   */
  toggleCheckbox(page) {
    if (this.state.selectedPages.has(page)) {
      this.state.selectedPages.delete(page);
    }
    else {
      this.state.selectedPages.add(page);
    }
    this.setState({ isDeleteConfirmModalShown: false });
    this.setState({ selectedPages: this.state.selectedPages });
  }

  /**
   * check and return is all pages selected for delete?
   *
   * @returns all pages selected (or not)
   * @memberof SearchResult
   */
  isAllSelected() {
    return this.state.selectedPages.size === this.props.pages.length;
  }

  /**
   * handle checkbox clicking that all pages select for delete
   *
   * @memberof SearchResult
   */
  handleAllSelect() {
    if (this.isAllSelected()) {
      this.state.selectedPages.clear();
    }
    else {
      this.state.selectedPages.clear();
      this.props.pages.map((page) => {
        this.state.selectedPages.add(page);
        return;
      });
    }
    this.setState({ selectedPages: this.state.selectedPages });
  }

  /**
   * change deletion mode
   *
   * @memberof SearchResult
   */
  handleDeletionModeChange() {
    this.state.selectedPages.clear();
    this.setState({ deletionMode: !this.state.deletionMode });
  }

  /**
   * toggle check delete completely
   *
   * @memberof SearchResult
   */
  toggleDeleteCompletely() {
    // request で completely が undefined でないと指定アリと見なされるため
    this.setState({ isDeleteCompletely: this.state.isDeleteCompletely ? undefined : true });
  }

  /**
   * delete selected pages
   *
   * @memberof SearchResult
   */
  deleteSelectedPages() {
    const deleteCompletely = this.state.isDeleteCompletely;
    Promise.all(Array.from(this.state.selectedPages).map((page) => {
      return new Promise((resolve, reject) => {
        const pageId = page._id;
        const revisionId = page.revision._id;

        this.props.appContainer.apiPost('/pages.remove', { page_id: pageId, revision_id: revisionId, completely: deleteCompletely })
          .then((res) => {
            if (res.ok) {
              this.state.selectedPages.delete(page);
              return resolve();
            }

            return reject();

          })
          .catch((err) => {
            console.log(err.message); // eslint-disable-line no-console
            this.setState({ errorMessageForDeleting: err.message });
            return reject();
          });
      });
    }))
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        toastr.error(err, 'Error occured', {
          closeButton: true,
          progressBar: true,
          newestOnTop: false,
          showDuration: '100',
          hideDuration: '100',
          timeOut: '3000',
        });
      });
  }

  /**
   * open confirm modal for page selection delete
   *
   * @memberof SearchResult
   */
  showDeleteConfirmModal() {
    this.setState({ isDeleteConfirmModalShown: true });
  }

  /**
   * close confirm modal for page selection delete
   *
   * @memberof SearchResult
   */
  closeDeleteConfirmModal() {
    this.setState({
      isDeleteConfirmModalShown: false,
      errorMessageForDeleting: undefined,
    });
  }

  render() {
    if (this.isError()) {
      return (
        <div className="content-main">
          <i className="searcing fa fa-warning"></i> Error on searching.
        </div>
      );
    }

    if (this.isNotSearchedYet()) {
      return <div />;
    }

    if (this.isNotFound()) {
      let under = '';
      if (this.props.tree != null) {
        under = ` under "${this.props.tree}"`;
      }
      return (
        <div className="content-main">
          <i className="icon-fw icon-info" /> No page found with &quot;{this.props.searchingKeyword}&quot;{under}
        </div>
      );

    }

    let deletionModeButtons = '';
    let allSelectCheck = '';

    if (this.state.deletionMode) {
      deletionModeButtons = (
        <div className="btn-group">
          <button type="button" className="btn btn-rounded btn-light btn-sm" onClick={() => { return this.handleDeletionModeChange() }}>
            <i className="icon-ban" /> Cancel
          </button>
          <button
            type="button"
            className="btn btn-rounded btn-danger btn-sm"
            onClick={() => { return this.showDeleteConfirmModal() }}
            disabled={this.state.selectedPages.size === 0}
          >
            <i className="icon-trash" /> Delete
          </button>
        </div>
      );
      allSelectCheck = (
        <div className="custom-control custom-checkbox custom-checkbox-danger">
          <input
            id="all-select-check"
            className="custom-control-input"
            type="checkbox"
            onChange={() => { return this.handleAllSelect() }}
            checked={this.isAllSelected()}
          />
          <label className="custom-control-label" htmlFor="all-select-check">&nbsp;Check All</label>
        </div>
      );
    }
    else {
      deletionModeButtons = (
        <div className="btn-group">
          <button type="button" className="btn btn-light rounded-pill btn-sm" onClick={() => { return this.handleDeletionModeChange() }}>
            <i className="ti-check-box" /> DeletionMode
          </button>
        </div>
      );
    }

    const listView = this.props.pages.map((page) => {
      // Add prefix 'id_' in pageId, because scrollspy of bootstrap doesn't work when the first letter of id attr of target component is numeral.
      const pageId = `#id_${page._id}`;
      return (
        <Page
          page={page}
          linkTo={pageId}
          key={page._id}
        >
          <div className="ml-auto d-flex">
            { this.state.deletionMode
              && (
                <div className="custom-control custom-checkbox custom-checkbox-danger">
                  <input
                    type="checkbox"
                    id={`page-delete-check-${page._id}`}
                    className="custom-control-input search-result-list-delete-checkbox"
                    value={pageId}
                    checked={this.state.selectedPages.has(page)}
                    onChange={() => { return this.toggleCheckbox(page) }}
                  />
                  <label className="custom-control-label" htmlFor={`page-delete-check-${page._id}`}></label>
                </div>
              )
            }
            <div className="page-list-option">
              <a href={page.path}><i className="icon-login" /></a>
            </div>
          </div>
        </Page>
      );
    });

    /*
    UI あとで考える
    <span className="search-result-meta">Found: {this.props.searchResultMeta.total} pages with "{this.props.searchingKeyword}"</span>
    */
    return (
      <div className="content-main">
        <div className="search-result row" id="search-result">
          <div className="col-lg-4 d-none d-lg-block page-list search-result-list" id="search-result-list">
            <nav>
              <div className="d-flex align-items-start justify-content-between mt-1">
                <div className="search-result-meta">
                  <i className="icon-magnifier" /> Found {this.props.searchResultMeta.total} pages with &quot;{this.props.searchingKeyword}&quot;
                </div>
                <div className="text-nowrap">
                  {deletionModeButtons}
                  {allSelectCheck}
                </div>
              </div>

              <div className="page-list">
                <ul className="page-list-ul page-list-ul-flat nav nav-pills">{listView}</ul>
              </div>
            </nav>
          </div>
          <div className="col-lg-8 search-result-content" id="search-result-content">
            <SearchResultList pages={this.props.pages} searchingKeyword={this.props.searchingKeyword} />
          </div>
        </div>
        <DeletePageListModal
          isShown={this.state.isDeleteConfirmModalShown}
          pages={Array.from(this.state.selectedPages)}
          errorMessage={this.state.errorMessageForDeleting}
          cancel={this.closeDeleteConfirmModal}
          confirmedToDelete={this.deleteSelectedPages}
          toggleDeleteCompletely={this.toggleDeleteCompletely}
        />
      </div> // content-main
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SearchResultWrapper = (props) => {
  return createSubscribedElement(SearchResult, props, [AppContainer]);
};

SearchResult.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  pages: PropTypes.array.isRequired,
  searchingKeyword: PropTypes.string.isRequired,
  searchResultMeta: PropTypes.object.isRequired,
  searchError: PropTypes.object,
  tree: PropTypes.string,
};
SearchResult.defaultProps = {
  searchError: null,
};

export default SearchResultWrapper;
