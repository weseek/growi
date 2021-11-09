import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv1-client';

import AppContainer from '~/client/services/AppContainer';

class BookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const {
      appContainer, pageId, isBookmarked, onChangeInvoked,
    } = this.props;
    const { isGuestUser } = appContainer;

    if (isGuestUser) {
      return;
    }

    try {
      const bool = !isBookmarked;
      await apiv3Put('/bookmarks', { pageId, bool });
      if (onChangeInvoked != null) {
        onChangeInvoked();
      }
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const {
      appContainer, t, isBookmarked, sumOfBookmarks,
    } = this.props;
    const { isGuestUser } = appContainer;

    return (
      <div>
        <button
          type="button"
          id="bookmark-button"
          onClick={this.handleClick}
          className={`btn btn-bookmark border-0
          ${`btn-${this.props.size}`} ${isBookmarked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
        >
          <i className="icon-star mr-3"></i>
          {sumOfBookmarks && (
            <span className="total-bookmarks">
              {sumOfBookmarks}
            </span>
          )}
        </button>

        {isGuestUser && (
          <UncontrolledTooltip placement="top" target="bookmark-button" fade={false}>
            {t('Not available for guest')}
          </UncontrolledTooltip>
        )}
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const BookmarkButtonWrapper = withUnstatedContainers(BookmarkButton, [AppContainer]);

BookmarkButton.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  pageId: PropTypes.string.isRequired,
  isBookmarked: PropTypes.bool.isRequired,
  sumOfBookmarks: PropTypes.number,
  onChangeInvoked: PropTypes.func,
  t: PropTypes.func.isRequired,
  size: PropTypes.string,
};

BookmarkButton.defaultProps = {
  size: 'md',
};

export default withTranslation()(BookmarkButtonWrapper);
