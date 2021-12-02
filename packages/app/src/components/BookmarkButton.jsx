import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';

import AppContainer from '~/client/services/AppContainer';

class LegacyBookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {

    if (this.props.onBookMarkClicked == null) {
      return;
    }
    this.props.onBookMarkClicked();
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
const LegacyBookmarkButtonWrapper = withUnstatedContainers(LegacyBookmarkButton, [AppContainer]);

LegacyBookmarkButton.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isBookmarked: PropTypes.bool.isRequired,
  sumOfBookmarks: PropTypes.number,
  t: PropTypes.func.isRequired,
  size: PropTypes.string,
  onBookMarkClicked: PropTypes.func,
};

LegacyBookmarkButton.defaultProps = {
  size: 'md',
};

const BookmarkButton = (props) => {
  return <LegacyBookmarkButtonWrapper {...props}></LegacyBookmarkButtonWrapper>;
};

export default withTranslation()(BookmarkButton);
