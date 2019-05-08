import React from 'react';
import PropTypes from 'prop-types';

export default class Draft extends React.Component {

  render() {
    return (
      <li className="page-list-li d-flex align-items-center">
        <a className="page-list-link" href={this.props.draft.path}>
          {this.props.draft.path}
        </a>
        <a href={`${this.props.draft.path}#edit`} target="_blank" rel="noopener noreferrer">
          <button type="button">Resume</button>
        </a>
        <button type="button" onClick={() => { return this.props.clearDraft(this.props.draft.path) }}>Delete</button>
      </li>
    );
  }

}

Draft.propTypes = {
  crowi: PropTypes.object.isRequired,
  draft: PropTypes.object.isRequired,
  clearDraft: PropTypes.func.isRequired,
};
