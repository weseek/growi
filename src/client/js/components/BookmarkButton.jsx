import React from 'react';
import PropTypes from 'prop-types';

export default class BookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      bookmarked: false,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    // if guest user
    if (!this.isUserLoggedIn()) {
      // do nothing
      return;
    }

    this.props.crowi.apiGet('/bookmarks.get', { page_id: this.props.pageId })
      .then((res) => {
        if (res.bookmark) {
          this.markBookmarked();
        }
      });
  }

  handleClick(event) {
    event.preventDefault();

    const pageId = this.props.pageId;

    if (!this.state.bookmarked) {
      this.props.crowi.apiPost('/bookmarks.add', { page_id: pageId })
        .then((res) => {
          this.markBookmarked();
        });
    }
    else {
      this.props.crowi.apiPost('/bookmarks.remove', { page_id: pageId })
        .then((res) => {
          this.markUnBookmarked();
        });
    }
  }

  markBookmarked() {
    this.setState({ bookmarked: true });
  }

  markUnBookmarked() {
    this.setState({ bookmarked: false });
  }

  isUserLoggedIn() {
    return this.props.crowi.me != null;
  }

  render() {
    // if guest user
    if (!this.isUserLoggedIn()) {
      return <div></div>;
    }

    const btnSizeClassName = this.props.size ? `btn-${this.props.size}` : 'btn-md';
    const addedClassNames = [
      this.state.bookmarked ? 'active' : '',
      btnSizeClassName,
    ];
    const addedClassName = addedClassNames.join(' ');

    return (
      <button
        type="button"
        href="#"
        title="Bookmark"
        onClick={this.handleClick}
        className={`btn-bookmark btn btn-default btn-circle btn-outline ${addedClassName}`}
      >
        <i className="icon-star"></i>
      </button>
    );
  }

}

BookmarkButton.propTypes = {
  pageId: PropTypes.string,
  crowi: PropTypes.object.isRequired,
  size: PropTypes.string,
};
