import React from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import CommentEditor from './CommentEditor';

const CommentEditorLazyRenderer = (props) => {

  const growiRenderer = props.appContainer.getRenderer('comment');

  return (
    <CommentEditor
      growiRenderer={growiRenderer}
      replyTo={undefined}
      isForNewComment
    />
  );
};

/**
 * Wrapper component for using unstated
 */
const CommentEditorLazyRendererWrapper = (props) => {
  return createSubscribedElement(CommentEditorLazyRenderer, props, [AppContainer]);
};

CommentEditorLazyRenderer.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default CommentEditorLazyRendererWrapper;
