import React from 'react';
import PropTypes from 'prop-types';

export default class Draft extends React.Component {

  render() {
    return (
      <li className="page-list-li d-flex align-items-center">
        <a href={`${this.props.draft.path}#edit`} target="_blank" rel="noopener noreferrer">
          <button type="button" className="btn-primary p-0">
            <span className="icon-note"></span>
          </button>
        </a>
        <button type="button" className="btn-danger p-0" onClick={() => { return this.props.clearDraft(this.props.draft.path) }}>
          <span className="icon-trash"></span>
        </button>
        <a className="page-list-link px-3" href={this.props.draft.path}>
          {this.props.draft.path}
        </a>
      </li>
    );
  }

}

Draft.propTypes = {
  crowi: PropTypes.object.isRequired,
  draft: PropTypes.object.isRequired,
  clearDraft: PropTypes.func.isRequired,
};
