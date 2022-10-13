import React from 'react';

import { Skelton } from './Skelton';

import styles from './PageComment.module.scss';
import CommentStyles from './PageComment/Comment.module.scss';
import CommentEditorStyles from './PageComment/CommentEditor.module.scss';

type PageCommentSkeltonProps = {
  commentTitleClasses?: string,
  roundedPill?: boolean,
}

export const PageCommentSkelton = (props: PageCommentSkeltonProps): JSX.Element => {
  const {
    commentTitleClasses,
  } = props;

  return (
    <>
      {/* TODO: Check the comment.html CSS */}
      <div className={`${styles['page-comment-styles']} page-comments-row comment-list`}>
        <div className="container-lg">
          <div className="page-comments">
            <h2 className={commentTitleClasses}><i className="icon-fw icon-bubbles"></i>Comments</h2>
            <div className="page-comments-list" id="page-comments-list">
              <div className={`${CommentStyles['comment-styles']} page-comment-thread pb-5  page-comment-thread-no-replies`}>
                <div className='page-comment flex-column'>
                  <div className='page-commnet-writer'>
                    <Skelton additionalClass='rounded-circle picture' roundedPill />
                  </div>
                  <Skelton additionalClass="page-comment-comment-body-skelton grw-skelton" />
                </div>
                <div className='page-comment flex-column ml-4 ml-sm-5 mr-3'>
                  <div className='page-commnet-writer mt-3'>
                    <Skelton additionalClass='rounded-circle picture' roundedPill />
                  </div>
                  <Skelton additionalClass="page-comment-comment-body-skelton grw-skelton mt-3" />
                </div>
                <div className="text-right">
                  <Skelton additionalClass="page-comment-button-skelton btn btn-outline-secondary btn-sm grw-skelton" />
                </div>
              </div>
            </div>
            <div className={`${CommentEditorStyles['comment-editor-styles']} form page-comment-form`}>
              <div className='comment-form'>
                <div className='comment-form-user'>
                  <Skelton additionalClass='rounded-circle picture' roundedPill />
                </div>
                <Skelton additionalClass="page-comment-commenteditorlazyrenderer-body-skelton grw-skelton" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
