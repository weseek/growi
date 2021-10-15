import React from 'react';
import PropTypes from 'prop-types';
import Page from '../PageList/Page';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:searchResultList');
class SearchResultList extends React.Component {

  render() {
    return this.props.pages.map((page) => {
      const pageId = `#${page._id}`;
      let snippet = '';
      if (page.snippet == null) {
        if (page.contentWithNoKeyword.length >= 40) {
          snippet = page.contentWithNoKeyword.substr(0, 40);
        }
        else {
          snippet = page.contentWithNoKeyword;
        }
      }
      else {
        snippet = page.snippet;
      }
      return (
        <li key={page._id} className="nav-item page-list-li w-100 m-0 border-bottom">
          <a
            className="nav-link page-list-link d-flex align-items-baseline"
            href={pageId}
            onClick={() => {
              try {
                if (this.props.onClickInvoked == null) { throw new Error('onClickInvoked is null') }
                this.props.onClickInvoked(page._id);
              }
              catch (error) {
                logger.error(error);
              }
            }}
          >
            <div className="form-check my-auto">
              <input className="form-check-input my-auto" type="checkbox" value="" id="flexCheckDefault" />
            </div>
            {/* TODO: remove dummy snippet and adjust style */}
            <div className="d-block">
              <Page page={page} noLink />
              <div
                className="border-gray mt-5"
                dangerouslySetInnerHTML={{ __html: snippet }}
              >
              </div>
            </div>
            <div className="ml-auto d-flex">
              {this.props.deletionMode && (
                <div className="custom-control custom-checkbox custom-checkbox-danger">
                  <input
                    type="checkbox"
                    id={`page-delete-check-${page._id}`}
                    className="custom-control-input search-result-list-delete-checkbox"
                    value={pageId}
                    checked={this.props.selectedPages.has(page)}
                    onChange={() => {
                      try {
                        if (this.props.onChangeInvoked == null) { throw new Error('onChnageInvoked is null') }
                        return this.props.onChangeInvoked(page);
                      }
                      catch (error) {
                        logger.error(error);
                      }
                    }}
                  />
                  <label className="custom-control-label" htmlFor={`page-delete-check-${page._id}`}></label>
                </div>
              )}
              <div className="page-list-option">
                <button
                  type="button"
                  className="btn btn-link p-0"
                  value={page.path}
                  onClick={(e) => {
                    window.location.href = e.currentTarget.value;
                  }}
                >
                  <i className="icon-login" />
                </button>
              </div>
            </div>
          </a>
        </li>
      );
    });
  }

}


SearchResultList.propTypes = {
  pages: PropTypes.array.isRequired,
  deletionMode: PropTypes.bool.isRequired,
  selectedPages: PropTypes.array.isRequired,
  onClickInvoked: PropTypes.func,
  onChangeInvoked: PropTypes.func,
};


export default SearchResultList;
