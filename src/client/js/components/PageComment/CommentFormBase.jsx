import React from 'react';
import PropTypes from 'prop-types';

// import { withTranslation } from 'react-i18next';

/**
 * @author Shin Oka <okas@weseek.co.jp>
 *
 * @export
 * @class CommentFormBase
 * @extends {React.Component}
 */

export default class CommentFormBase extends React.Component {

  render() {
    let childrenWithProps;
    if (this.props.data !== undefined) {
      childrenWithProps = React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child, this.props.data);
      });
    }
    else {
      const data = {
        pageId: this.props.pageId,
        pagePath: this.props.pagePath,
        onPostComplete: this.props.onPostComplete,
        revisionId: this.props.revisionId,
        revisionCreatedAt: this.props.revisionCreatedAt,
        editorOptions: this.props.editorOptions,
        slackChannels: this.props.slackChannels,
      };

      childrenWithProps = React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child, data);
      });
    }

    return <div>{childrenWithProps}</div>;
  }

}

CommentFormBase.propTypes = {
  children: PropTypes.node,
  pageId: PropTypes.string,
  pagePath: PropTypes.string,
  onPostComplete: PropTypes.func,
  editorOptions: PropTypes.object,
  slackChannels: PropTypes.string,
  revisionId: PropTypes.string,
  revisionCreatedAt: PropTypes.number,
  data: PropTypes.object,
};
