import React from 'react';
import PropTypes from 'prop-types';

import RevisionBody from '../Page/RevisionBody';

/**
 * Wrapper component for Page/RevisionBody
 */
export default class CommentPreview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        className="page-comment-preview-body"
        ref={(elm) => {
            this.previewElement = elm;
            this.props.inputRef(elm);
          }}
      >

        <RevisionBody
          {...this.props}
          additionalClassName="comment"
        />
      </div>
    );
  }
}

CommentPreview.propTypes = {
  html: PropTypes.string,
  inputRef: PropTypes.func.isRequired, // for getting div element
};
