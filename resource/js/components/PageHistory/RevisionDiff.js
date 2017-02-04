import React from 'react';

export default class RevisionDiff extends React.Component {

  render() {
    return (
      <div className="revision-hisory-outer">
        diff
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


