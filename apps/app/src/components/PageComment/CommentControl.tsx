import React from 'react';


type CommentControlProps = {
  onClickEditBtn: () => void,
  onClickDeleteBtn: () => void,
}

export const CommentControl = (props: CommentControlProps): JSX.Element => {

  const { onClickEditBtn, onClickDeleteBtn } = props;

  return (
    // The page-comment-control class is imported from Comment.module.scss
    <div className="page-comment-control">
      <button type="button" className="btn btn-link p-2" onClick={onClickEditBtn}>
        <i className="ti ti-pencil"></i>
      </button>
      <button
        data-testid="comment-delete-button"
        type="button"
        className="btn btn-link p-2 me-2"
        onClick={onClickDeleteBtn}
      >
        <i className="ti ti-close"></i>
      </button>
    </div>
  );

};
