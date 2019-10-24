import React from 'react';
import PropTypes from 'prop-types';

// TODO: GW-333
// import Checkbox from 'react-bootstrap/es/Checkbox';

export default class DeletePageListModal extends React.Component {

  /*
   * the threshold for omitting body
   */
  static get OMIT_BODY_THRES() { return 400 }

  componentWillMount() {
  }

  render() {
    if (this.props.pages == null || this.props.pages.length === 0) {
      return <div></div>;
    }

    const listView = this.props.pages.map((page) => {
      return (
        <li key={page._id}>{page.path}</li>
      );
    });

    return (
      <div
        className="page-list-delete-modal modal-dialog modal-dialog-centered"
        role="document"
        isOpen={this.props.isShown}
        toggle={this.props.cancel}
      >
        <div className="modal-header" toggle={this.props.cancel}>
          Deleting pages:
        </div>
        <div className="modal-body border-bottom">
          <ul>
            {listView}
          </ul>
        </div>
        <div className="modal-footer">
          {/*  TODO:refactoring the layout of this form */}
          <div className="d-flex justify-content-between">
            <span className="text-danger">{this.props.errorMessage}</span>
            <div className="form-group form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="delete-completely"
                onClick={this.props.toggleDeleteCompletely}
              />
              <label className="form-check-label" htmlFor="delete-completely text-danger">Delete completely</label>
            </div>
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={this.props.confirmedToDelete}
            >
              <i className="icon-trash"></i>Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

}

DeletePageListModal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  pages: PropTypes.array,
  errorMessage: PropTypes.string,
  cancel: PropTypes.func.isRequired, //                 for cancel evnet handling
  confirmedToDelete: PropTypes.func.isRequired, //      for confirmed event handling
  toggleDeleteCompletely: PropTypes.func.isRequired, // for delete completely check event handling
};
