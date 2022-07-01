import React from 'react';

import PropTypes from 'prop-types';

import RevisionBody from '../Page/RevisionBody';

/**
 * Wrapper component for Page/RevisionBody
 */
const CommentPreview = (props) => {

  return (
    <div className="page-comment-preview-body">
      <RevisionBody
        html={props.html}
        additionalClassName="comment"
        isMathJaxEnabled
        renderMathJaxInRealtime
      />
    </div>
  );

};

CommentPreview.propTypes = {
  html: PropTypes.string,
};

export default CommentPreview;
