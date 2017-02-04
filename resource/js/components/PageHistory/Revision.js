import React from 'react';

import UserDate     from '../Common/UserDate';
import Icon         from '../Common/Icon';
import UserPicture  from '../User/UserPicture';
import RevisionDiff from './RevisionDiff';

export default class Revision extends React.Component {

  constructor(props) {
    super(props);

    this.openRevisionDiff = this.openRevisionDiff.bind(this);
  }

  componentDidMount() {
  }

  openRevisionDiff() {
    this.props.fetchPreviousRevision(this.props.revision);
  }

  render() {
    const revision = this.props.revision;
    const author = revision.author;

    let pic = '';
    if (typeof author === 'object') {
      pic = <UserPicture user={author} />;
    }

    //<a href={"?revision=" + revision._id }><Icon name="history" /> {{ t('View this version') }}</a>
    return (
      <div className="revision-hisory-outer">
        {pic}
        <div className="revision-history-main">
          <div className="revision-history-author">
            <strong>{author.username}</strong>
          </div>
          <div className="revision-history-meta">
            <UserDate dateTime={revision.createdAt} />
            <br />
            <a href={"?revision=" + revision._id }>
              <Icon name="history" /> View this version
            </a>
            <a className="diff-view" onClick={this.openRevisionDiff}>
              <Icon name="arrow-circle-right" /> View diff
            </a>

            <RevisionDiff
              current={revision}
              previous={this.props.previousRevisionText}
            />
          </div>
        </div>
      </div>
    );
  }
    /*
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
        */
}

Revision.propTypes = {
  revision: React.PropTypes.object,
  previousRevisionText: React.PropTypes.string,
}

