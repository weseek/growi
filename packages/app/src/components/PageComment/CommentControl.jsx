import React from 'react';
import PropTypes from 'prop-types';


const CommentControl = (props) => {
  return (
    <div className="page-comment-control">
      <button type="button" className="btn btn-link p-2" onClick={props.onClickEditBtn}>
        <i className="ti-pencil"></i>
      </button>
      <button type="button" className="btn btn-link p-2 mr-2" onClick={props.onClickDeleteBtn}>
        <i className="ti-close"></i>
      </button>
    </div>
  );
};

CommentControl.propTypes = {

  onClickEditBtn: PropTypes.func.isRequired,
  onClickDeleteBtn: PropTypes.func.isRequired,
};

export default CommentControl;
