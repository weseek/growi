import React from 'react';
import PropTypes from 'prop-types';

import { Collapse } from 'reactstrap';

import { useGrowiRendererConfig } from '~/stores/context';

import Comment from './Comment';

<<<<<<< HEAD
=======
import { withUnstatedContainers } from '../UnstatedUtils';

import { RendererOptions } from '~/services/renderer/renderer';

>>>>>>> support/apply-nextjs-to-PageComments
class ReplayComments extends React.PureComponent {

  constructor() {
    super();

    this.state = {
      isOlderRepliesShown: false,
    };

    this.toggleOlderReplies = this.toggleOlderReplies.bind(this);
  }

  toggleOlderReplies() {
    this.setState({ isOlderRepliesShown: !this.state.isOlderRepliesShown });
  }

  renderReply(reply) {
    return (
      <div key={reply._id} className="page-comment-reply ml-4 ml-sm-5 mr-3">
        <Comment
          comment={reply}
          deleteBtnClicked={this.props.deleteBtnClicked}
          rendererOptions={this.props.rendererOptions}
          isReadOnly={this.props.isReadOnly}
        />
      </div>
    );
  }

  render() {
    const { config } = this.props

    const isAllReplyShown = config.isAllReplyShown || false;
    const replyList = this.props.replyList;

    if (isAllReplyShown) {
      return (
        <React.Fragment>
          {replyList.map((reply) => {
            return this.renderReply(reply);
          })}
        </React.Fragment>
      );
    }

    const areThereHiddenReplies = (replyList.length > 2);

    const { isOlderRepliesShown } = this.state;
    const toggleButtonIconName = isOlderRepliesShown ? 'icon-arrow-up' : 'icon-options-vertical';
    const toggleButtonIcon = <i className={`icon-fw ${toggleButtonIconName}`}></i>;
    const toggleButtonLabel = isOlderRepliesShown ? '' : 'more';

    const shownReplies = replyList.slice(replyList.length - 2, replyList.length);
    const hiddenReplies = replyList.slice(0, replyList.length - 2);

    const hiddenElements = hiddenReplies.map((reply) => {
      return this.renderReply(reply);
    });

    const shownElements = shownReplies.map((reply) => {
      return this.renderReply(reply);
    });

    return (
      <React.Fragment>
        {areThereHiddenReplies && (
          <div className="page-comments-hidden-replies">
            <Collapse isOpen={this.state.isOlderRepliesShown}>
              <div>{hiddenElements}</div>
            </Collapse>
            <div className="text-center">
              <button
                type="button"
                className="btn btn-link"
                onClick={this.toggleOlderReplies}
              >
                {toggleButtonIcon} {toggleButtonLabel}
              </button>
            </div>
          </div>
        )}
        {shownElements}

      </React.Fragment>
    );
  }

}

ReplayComments.propTypes = {
  rendererOptions: PropTypes.instanceOf(RendererOptions).isRequired,
  deleteBtnClicked: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool.isRequired,
  replyList: PropTypes.array,
};

const ReplayCommentsWrapperFC = (props) => {
  const { data: config } = useGrowiRendererConfig();

  return <ReplayComments config={config} {...props} />;
};

export default ReplayCommentsWrapperFC;
