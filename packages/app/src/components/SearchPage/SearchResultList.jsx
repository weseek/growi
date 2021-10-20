import React from 'react';
import PropTypes from 'prop-types';
import Page from '../PageList/Page';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:searchResultList');
class SearchResultList extends React.Component {

  render() {
    return this.props.pages.map((page) => {
      // Add prefix 'id_' in pageId, because scrollspy of bootstrap doesn't work when the first letter of id attr of target component is numeral.
      const pageId = `#${page._id}`;
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
            <div className="d-flex">
              <div className="form-check my-auto">
                <input className="form-check-input my-auto" type="checkbox" value="" id="flexCheckDefault" />
              </div>
              <div>
                <div className="d-block d-flex">
                  <Page page={page} noLink />
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
                </div>
                {/* TODO: remove dummy snippet and adjust style */}
                <div className="border-gray mt-5">{page.snippet}</div>
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
