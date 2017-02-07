import React from 'react';

import Icon from './Common/Icon';
import PageRevisionList from './PageHistory/PageRevisionList';

export default class PageHistory extends React.Component {

  constructor(props) {
    super(props);

    this.crowi = window.crowi; // FIXME

    this.state = {
      revisions: [],
      diffOpened: {},
    };

    this.getPreviousRevision = this.getPreviousRevision.bind(this);
    this.onDiffOpenClicked = this.onDiffOpenClicked.bind(this);
  }

  componentDidMount() {
    const pageId = this.props.pageId;

    if (!pageId) {
      return ;
    }

    this.crowi.apiGet('/revisions.ids', {page_id: pageId})
    .then(res => {

      const rev = res.revisions;
      let diffOpened = {};
      const lastId = rev.length - 1;
      res.revisions.map((revision, i) => {
        const user = this.crowi.findUserById(revision.author);
        if (user) {
          rev[i].author = user;
        }

        if (i === 0 || i === lastId) {
          diffOpened[revision._id] = true;
        } else {
          diffOpened[revision._id] = false;
        }
      });

      this.setState({
        revisions: rev,
        diffOpened: diffOpened,
      });

      // load 0, and last default
      if (rev[0]) {
        this.fetchPageRevisionBody(rev[0]);
      }
      if (rev[1]) {
        this.fetchPageRevisionBody(rev[1]);
      }
      if (lastId !== 0 && lastId !== 1 && rev[lastId]) {
        this.fetchPageRevisionBody(rev[lastId]);
      }
    }).catch(err => {
      // do nothing
    });
  }

  getPreviousRevision(currentRevision) {
    let cursor = null;
    for (let revision of this.state.revisions) {
      if (cursor && cursor._id == currentRevision._id) {
        cursor = revision;
        break;
      }

      cursor = revision;
    }

    return cursor;
  }

  onDiffOpenClicked(revision)
  {
    const diffOpened = this.state.diffOpened,
      revisionId = revision._id;

    if (diffOpened[revisionId]) {
      return ;
    }

    diffOpened[revisionId] = true;
    this.setState({
      diffOpened
    });

    this.fetchPageRevisionBody(revision);
    this.fetchPageRevisionBody(this.getPreviousRevision(revision));
  }

  fetchPageRevisionBody(revision)
  {
    if (revision.body) {
      return ;
    }

    this.crowi.apiGet('/revisions.get', {revision_id: revision._id})
    .then(res => {
      if (res.ok) {
        this.setState({
          revisions: this.state.revisions.map((rev) => {
            if (rev._id == res.revision._id) {
              return res.revision;
            }

            return rev;
          })
        })
      }
    }).catch(err => {

    });

  }

  render() {
    return (
      <div>
        <h1><Icon name="history" /> History</h1>
        <PageRevisionList
          revisions={this.state.revisions}
          diffOpened={this.state.diffOpened}
          getPreviousRevision={this.getPreviousRevision}
          onDiffOpenClicked={this.onDiffOpenClicked}
        />
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
