import React from 'react';
import PropTypes from 'prop-types';

import RevisionRenderer from './RevisionRenderer';

export default class RevisionLoader extends React.Component {

  constructor(props) {
    super(props);
    this.logger = require('@alias/logger')('growi:Page:RevisionLoader');

    this.state = {
      markdown: '',
      error: null,
    };

    this.loadData = this.loadData.bind(this);
  }

  componentWillMount() {
    this.loadData();
  }

  loadData() {
    const requestData = {
      page_id: this.props.pageId,
      revision_id: this.props.revisionId,
    };

    // load data with REST API
    this.props.crowi.apiGet('/revisions.get', requestData)
      .then(res => {
        if (!res.ok) {
          throw new Error(res.error);
        }

        this.setState({
          markdown: res.revision.body,
          error: null,
        });
      })
      .catch(err => {
        this.setState({ error: err });
      });
  }

  render() {
    let markdown = this.state.markdown;
    if (this.state.error != null) {
      markdown = `<span class="text-muted"><em>${this.state.error}</em></span>`;
    }

    return (
      <RevisionRenderer
          crowi={this.props.crowi} crowiRenderer={this.props.crowiRenderer}
          pagePath={this.props.pagePath}
          markdown={markdown}
          highlightKeywords={this.props.highlightKeywords}
      />
    );
  }
}

RevisionLoader.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiRenderer: PropTypes.object.isRequired,
  pageId: PropTypes.string.isRequired,
  pagePath: PropTypes.string.isRequired,
  revisionId: PropTypes.string.isRequired,
  lazy: PropTypes.bool.isRequired,
  highlightKeywords: PropTypes.string,
};
