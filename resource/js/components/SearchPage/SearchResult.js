import React from 'react';
import PropTypes from 'prop-types';

import Page from '../PageList/Page';
import SearchResultList from './SearchResultList';
import SearchResultInput from './SearchResultInput';

// Search.SearchResult
export default class SearchResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deletionMode : false,
      selectedPages : new Set(),
    }
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
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

  toggleCheckbox(page) {
    if (this.state.selectedPages.has(page)) {
      this.state.selectedPages.delete(page);
    } else {
      this.state.selectedPages.add(page);
    }
    this.setState({selectedPages: this.state.selectedPages});
  }

  handleDeletionModeChange() {
    this.setState({deletionMode: !this.state.deletionMode});
  }

  handleFormSubmit() {
      // delete
      $('#delete-pages-form').submit(function(e) {
        $.ajax({
          type: 'POST',
          url: '/_api/pages.remove',
          data: $('#delete-pages-form').serialize(),
          dataType: 'json'
        }).done(function(res) {
          if (!res.ok) {
            $('#delete-errors').html('<i class="fa fa-times-circle"></i> ' + res.error);
            $('#delete-errors').addClass('alert-danger');
          } else {
            var page = res.page;
            top.location.href = page.path;
          }
        });

        return false;
      });
  }

  render() {
    const excludePathString = this.props.tree;

    //console.log(this.props.searchError);
    //console.log(this.isError());
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
      if (this.props.tree !== '') {
        under = ` under "${this.props.tree}"`;
      }
      return (
        <div className="content-main">
            <i className="fa fa-meh-o" /> No page found with "{this.props.searchingKeyword}"{under}
        </div>
      );

    }

    let deletionModeButtons = '';

    if (this.state.deletionMode) {
      deletionModeButtons =
      <div className="btn-group">
        <button type="button" className="btn btn-danger" data-target="#deletePages" data-toggle="modal"><i className="fa fa-trash-o"/> Delete</button>
        <button type="button" className="btn btn-default" onClick={() => this.handleDeletionModeChange()}><i className="fa fa-undo"/> Cancel</button>
      </div>
    }
    else {
      deletionModeButtons =
      <div className="btn-group">
        <button type="button" className="btn btn-default" onClick={() => this.handleDeletionModeChange()}><i className="fa fa-trash-o"/> DeletionMode</button>
      </div>
    }

    const listView = this.props.pages.map((page) => {
      const pageId = "#" + page._id;
      return (
        <Page page={page}
          linkTo={pageId}
          key={page._id}
          excludePathString={excludePathString}
          >
          <SearchResultInput
            page={page}
            deletionMode={this.state.deletionMode}
            handleCheckboxChange={this.toggleCheckbox}/>
          <div className="page-list-option">
            <a href={page.path}><i className="fa fa-arrow-circle-right" /></a>
          </div>
        </Page>
      );
    });

    const selectedListView = Array.from(this.state.selectedPages).map((page) => {
        return (
          <li key={page._id}>{page.path}</li>
        );
    });

    // TODO あとでなんとかする
    setTimeout(() => {
      $('#search-result-list > nav').affix({ offset: { top: 120 }});
    }, 1200);

    /*
    UI あとで考える
    <span className="search-result-meta">Found: {this.props.searchResultMeta.total} pages with "{this.props.searchingKeyword}"</span>
    */
    return (
      <div className="content-main">
        <div className="search-result row" id="search-result">
          <div className="col-md-4 hidden-xs hidden-sm page-list search-result-list" id="search-result-list">
            <nav data-spy="affix" data-offset-top="120">
              {deletionModeButtons}
              <ul className="page-list-ul page-list-ul-flat nav">
                {listView}
              </ul>
            </nav>
          </div>
          <div className="col-md-8 search-result-content" id="search-result-content">
            <div className="search-result-meta"><i className="fa fa-lightbulb-o" /> Found {this.props.searchResultMeta.total} pages with "{this.props.searchingKeyword}"</div>
            <SearchResultList
              pages={this.props.pages}
              searchingKeyword={this.props.searchingKeyword}
              />
          </div>
        </div>
        <div id="crowi-modals">
          <div className="modal" id="deletePages">
            <div className="modal-dialog">
              <div className="modal-content">
              <form role="form" id="delete-pages-form" onSubmit="return false;">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                  <h4 className="modal-title"><i className="fa fa-trash-o"></i> Delete Pages</h4>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="">Deleting pages:</label>
                    <ul>
                      {selectedListView}
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <p><small className="pull-left" id="delete-errors"></small></p>
                  <input type="hidden" name="_csrf" value="{{ csrf() }}"/>
                  <input type="hidden" name="path" value="{{ page.path }}"/>
                  <input type="hidden" name="page_id" value="{{ page._id.toString() }}"/>
                  <input type="hidden" name="revision_id" value="{{ page.revision._id.toString() }}"/>
                  <button type="submit" className="btn btn-danger delete-button" onClick={this.handleFormSubmit}>Delete</button>
                </div>

              </form>
              </div>
            </div>
          </div>
        </div>

      </div>//content-main
    );
  }
}

SearchResult.propTypes = {
  tree: PropTypes.string.isRequired,
  pages: PropTypes.array.isRequired,
  searchingKeyword: PropTypes.string.isRequired,
  searchResultMeta: PropTypes.object.isRequired,
};
SearchResult.defaultProps = {
  tree: '',
  pages: [],
  searchingKeyword: '',
  searchResultMeta: {},
  searchError: null,
};
