import React from 'react';
import PropTypes from 'prop-types';

import Icon from './Common/Icon'

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

    this.props.crowi.apiGet('/bookmarks.get', {page_id: this.props.pageId})
    .then(res => {
      if (res.bookmark) {
        this.markBookmarked();
      }
    });
  }

  handleClick(event) {
    event.preventDefault();

    const pageId = this.props.pageId;

    if (!this.state.bookmarked) {
      this.props.crowi.apiPost('/bookmarks.add', {page_id: pageId})
      .then(res => {
        this.markBookmarked();
      });
    } else {
      this.props.crowi.apiPost('/bookmarks.remove', {page_id: pageId})
      .then(res => {
        this.markUnBookmarked();
      });
    }
  }

  markBookmarked() {
    this.setState({bookmarked: true});
  }

  markUnBookmarked() {
    this.setState({bookmarked: false});
  }

  isUserLoggedIn() {
    return this.props.crowi.me !== '';
  }

  render() {
    // if guest user
    if (!this.isUserLoggedIn()) {
      return <div></div>;
    }

    const iconName = this.state.bookmarked ? 'star' : 'star-o';

    return (
      <a href="#" title="Bookmark" className="bookmark-link" onClick={this.handleClick}>
        <Icon name={iconName} />
      </a>
    );
  }
}

BookmarkButton.propTypes = {
  pageId: PropTypes.string,
  crowi: PropTypes.object.isRequired,
};
