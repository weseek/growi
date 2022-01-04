import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import PageContainer from '~/client/services/PageContainer';
import AppContainer from '~/client/services/AppContainer';

class BookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const { appContainer, pageContainer } = this.props;
    const { isGuestUser } = appContainer;

    if (isGuestUser) {
      return;
    }

    try {
      pageContainer.toggleBookmark();
    }
    catch (err) {
      toastError(err);
    }
  }


  render() {
    const { appContainer, pageContainer, t } = this.props;
    const { isGuestUser } = appContainer;

    return (
      <div>
        <button
          type="button"
          id="bookmark-button"
          onClick={this.handleClick}
          className={`btn btn-bookmark border-0
          ${`btn-${this.props.size}`} ${pageContainer.state.isBookmarked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
        >
          <i className="icon-star mr-3"></i>
          <span className="total-bookmarks">
            {pageContainer.state.sumOfBookmarks}
          </span>
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
const BookmarkButtonWrapper = withUnstatedContainers(BookmarkButton, [AppContainer, PageContainer]);

BookmarkButton.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  pageId: PropTypes.string,
  t: PropTypes.func.isRequired,
  size: PropTypes.string,
};

BookmarkButton.defaultProps = {
  size: 'md',
};

export default withTranslation()(BookmarkButtonWrapper);
