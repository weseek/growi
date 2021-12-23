import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

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
      appContainer, t, isBookmarked, hideTotalNumber, sumOfBookmarks,
    } = this.props;
    const { isGuestUser } = appContainer;

    return (
      <>
        <button
          type="button"
          id="bookmark-button"
          onClick={this.handleClick}
          className={`btn btn-bookmark border-0
          ${`btn-${this.props.size}`} ${isBookmarked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
        >
          <i className={`fa ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
          { !hideTotalNumber && (
            <span className="total-bookmarks ml-3">
              {sumOfBookmarks && (
                sumOfBookmarks
              )}
            </span>
          ) }
        </button>

        {isGuestUser && (
          <UncontrolledTooltip placement="top" target="bookmark-button" fade={false}>
            {t('Not available for guest')}
          </UncontrolledTooltip>
        )}
      </>
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

  hideTotalNumber: PropTypes.bool,
  sumOfBookmarks: PropTypes.number,
  t: PropTypes.func.isRequired,
  size: PropTypes.string,
  onBookMarkClicked: PropTypes.func,
};

LegacyBookmarkButton.defaultProps = {
  size: 'md',
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const BookmarkButton = (props) => {
  const { t } = useTranslation();
  return <LegacyBookmarkButtonWrapper t={t} {...props}></LegacyBookmarkButtonWrapper>;
};

export default BookmarkButton;
