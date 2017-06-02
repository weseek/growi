import React from 'react';
import PropTypes from 'prop-types';

export default class PageComments extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentComments: [],
      newerComments: [],
      olderComments: [],
    };

    this.fetchPageComments = this.fetchPageComments.bind(this);
  }

  componentWillMount() {
    const pageId = this.props.pageId;

    if (pageId) {
      this.fetchPageComments();
    }
  }

  fetchPageComments() {
    if (!this.props.pageId) {
      return ;
    }

    const pageId = this.props.pageId;
    const revisionId = this.props.revisionId;
    const revisionCreatedAt = this.props.revisionCreatedAt;

    this.props.crowi.apiGet('/comments.get', {page_id: pageId})
    .then(res => {
      if (res.ok) {
        let currentComments = [];
        let newerComments = [];
        let olderComments = [];

        // divide by revisionId and createdAt
        res.comments.forEach((comment) => {
          if (comment.revision == revisionId) {
            currentComments.push(comment);
          }
          else if (Date.parse(comment.createdAt)/1000 > revisionCreatedAt) {
            newerComments.push(comment);
          }
          else {
            olderComments.push(comment);
          }
        });
        this.setState({currentComments, newerComments, olderComments});
      }
    }).catch(err => {

    });

  }

  render() {
    // TODO impl elements
    let currentElements = this.state.currentComments.map((comment) => {
      return <p>{comment.comment}</p>
    });
    let newerElements = this.state.newerComments.map((comment) => {
      return <p>{comment.comment}</p>
    });
    let olderElements = this.state.olderComments.map((comment) => {
      return <p>{comment.comment}</p>
    });

    return (
      <div>
        <div>{currentElements}</div>
        <div>{newerElements}</div>
        <div>{olderElements}</div>
      </div>
    );
  }
}

PageComments.propTypes = {
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
  revisionCreatedAt: PropTypes.number,
  crowi: PropTypes.object.isRequired,
};
