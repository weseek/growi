import React from 'react';
import PropTypes from 'prop-types';

export default class Draft extends React.Component {

  render() {
    return (
      <li className="page-list-li d-flex align-items-center">
        <a href={`${this.props.path}#edit`} target="_blank" rel="noopener noreferrer">
          <button type="button" className="btn-primary p-0">
            <span className="icon-note"></span>
          </button>
        </a>
        <button type="button" className="btn-danger p-0" onClick={() => { return this.props.clearDraft(this.props.path) }}>
          <span className="icon-trash"></span>
        </button>
        <a className="page-list-link px-3" href={this.props.path}>
          {this.props.path} {this.props.markdown} {this.props.isExist ? 'exists' : ''}
        </a>
      </li>
    );
  }

}

Draft.propTypes = {
  crowi: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  markdown: PropTypes.string.isRequired,
  isExist: PropTypes.bool.isRequired,
  clearDraft: PropTypes.func.isRequired,
};
