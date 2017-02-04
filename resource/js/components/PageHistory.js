import React from 'react';

import Icon from './Common/Icon';
import PageRevisionList from './PageHistory/PageRevisionList';

export default class PageHistory extends React.Component {

  constructor(props) {
    super(props);

    this.crowi = window.crowi; // FIXME

    this.state = {
      revisions: [],
    };
  }

  componentDidMount() {
    const pageId = this.props.pageId;

    if (!pageId) {
      return ;
    }

    this.crowi.apiGet('/revisions.ids', {page_id: pageId})
    .then(res => {

      const rev = res.revisions;
      res.revisions.map((revision, i) => {
        const user = this.crowi.findUserById(revision.author);
        if (user) {
          rev[i].author = user;
        }
      });

      this.setState({revisions: rev});
    }).catch(err => {
      // do nothing
    });
  }

  fetchPageRevisionBody()
  {
  }

  render() {
    return (
      <div>
        <h1><Icon name="history" /> History</h1>
        <PageRevisionList revisions={this.state.revisions} />
      </div>
    );
  }
}

PageHistory.propTypes = {
  pageId: React.PropTypes.string,
};

/*
    <div class="tab-pane revision-history" id="revision-history">
      <div class="revision-history-list">
        {% for tt in tree %}
        <div class="revision-hisory-outer">
          <img src="{{ tt.author|picture }}" class="picture picture-rounded">
          <div class="revision-history-main">
            <div class="revision-history-author">
              <strong>{% if tt.author %}{{ tt.author.username }}{% else %}-{% endif %}</strong>
            </div>
            <div class="revision-history-comment">
            </div>
            <div class="revision-history-meta">
              {{ tt.createdAt|datetz('Y-m-d H:i:s') }}
              <br>
              <a href="?revision={{ tt._id.toString() }}"><i class="fa fa-history"></i> {{ t('View this version') }}</a>
              <a class="diff-view" data-revision-id="{{ tt._id.toString() }}">
                <i id="diff-icon-{{ tt._id.toString() }}" class="fa fa-arrow-circle-right"></i> {{ t('View diff') }}
              </a>
              <div class="" id="diff-display-{{ tt._id.toString()}}" style="display: none"></div>
            </div>
          </div>
        </div>
        {% endfor %}
      </div>
      */
