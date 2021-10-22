import React from 'react';
import PropTypes from 'prop-types';
import SearchResultListItem from './SearchResultListItem';

class SearchResultList extends React.Component {

  constructor(props) {
    super(props);

    this.renderDropDown = this.renderDropDown.bind(this);
  }

  renderDropDown() {
    return (
      <>
        <button
          type="button"
          className="btn-link nav-link dropdown-toggle dropdown-toggle-no-caret border-0 rounded grw-btn-page-management py-0"
          data-toggle="dropdown"
        >
          <i className="icon-options"></i>
        </button>
        <div className="dropdown-menu dropdown-menu-right">
          <button className="dropdown-item" type="button">
            <i className="icon-fw  icon-action-redo"></i>Move/Rename
          </button>
          <button className="dropdown-item" type="button">
            <i className="icon-fw icon-docs"></i>Duplicate
          </button>
          <button className="dropdown-item text-danger" type="button">
            <i className="icon-fw icon-fire"></i>Delete
          </button>
        </div>
      </>
    );
  }

  render() {
    return this.props.pages.map((page) => {
      return (
        <SearchResultListItem
          page={page}
          onClickInvoked={this.props.onClickInvoked}
          noLink
        />
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
