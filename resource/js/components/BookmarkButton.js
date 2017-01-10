import React from 'react';
import $ from 'jquery';

export default class BookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      bookmarked: false,
      pageId: null,
      token: null,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    // FIXME(property?)
    this.setState({
      pageId: $('#content-main').data('page-id'),
      token: $('#bookmark-button-react').data('csrftoken'),
    });
  }

  componentDidMount() {
    $.get('/_api/bookmarks.get', {page_id: this.state.pageId}, (res) => {
      if (res.ok) {
        if (res.bookmark) {
          this.markBookmarked();
        }
      }
    });
  }

  handleClick(event) {
    event.preventDefault();

    const token = this.state.token;
    const pageId = this.state.pageId;

    if (!this.state.bookmarked) {
      $.post('/_api/bookmarks.add', {_csrf: token, page_id: pageId}, (res) => {
        if (res.ok && res.bookmark) {
          this.markBookmarked();
        }
      });
    } else {
      $.post('/_api/bookmarks.remove', {_csrf: token, page_id: pageId}, (res) => {
        if (res.ok) {
          this.markUnBookmarked();
        }
      });
    }
  }

  markBookmarked() {
    this.setState({bookmarked: true});
  }

  markUnBookmarked() {
    this.setState({bookmarked: false});
  }

  render() {
    const className = this.state.bookmarked ? 'fa fa-star' : 'fa fa-star-o';

    return (
      <a href="#" title="Bookmark" className="bookmark-link" onClick={this.handleClick}><i className={className}></i></a>
    );
  }
}
