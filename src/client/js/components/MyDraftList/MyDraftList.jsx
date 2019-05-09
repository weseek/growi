import React from 'react';

import PropTypes from 'prop-types';

import Draft from '../PageList/Draft';

export default class MyDraftList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      drafts: [],
    };

    this.getDraftsFromLocalStorage = this.getDraftsFromLocalStorage.bind(this);
    this.clearDraft = this.clearDraft.bind(this);
  }

  componentWillMount() {
    this.getDraftsFromLocalStorage();
  }

  getDraftsFromLocalStorage() {
    const draftsAsObj = JSON.parse(this.props.crowi.localStorage.getItem('draft') || '{}');

    // {'/a': '#a', '/b': '#b'} => [{path: '/a', markdown: '#a'}, {path: '/b', markdown: '#b'}]
    const drafts = Object.entries(draftsAsObj).map((d) => {
      return {
        path: d[0],
        markdown: d[1],
      };
    });

    this.setState({
      drafts: drafts || [],
    });
  }

  /**
   * generate Elements of Draft
   *
   * @param {any} drafts Array of pages Model Obj
   *
   */
  generateDraftList(drafts) {
    return drafts.map((draft) => {
      return <Draft key={draft.path} crowi={this.props.crowi} draft={draft} clearDraft={this.clearDraft} />;
    });
  }

  clearDraft(path) {
    this.props.crowi.clearDraft(path);

    this.setState((prevState) => {
      return {
        drafts: prevState.drafts.filter((draft) => { return draft.path !== path }),
      };
    });
  }

  render() {
    return (
      <div className="page-list-container-create">
        <ul className="page-list-ul page-list-ul-flat">
          {this.generateDraftList(this.state.drafts)}
        </ul>
      </div>
    );
  }

}

MyDraftList.propTypes = {
  crowi: PropTypes.object.isRequired,
};
