import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '../util/apiNotification';
import PageContainer from '../services/PageContainer';
import AppContainer from '../services/AppContainer';

class BookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const { pageContainer } = this.props;

    try {
      pageContainer.toggleBookmark();
    }
    catch (err) {
      toastError(err);
    }
  }


  render() {
    const { pageContainer, t } = this.props;
    const isUserLoggedIn = this.props.appContainer.currentUser != null;

    return (
      <div id="bookmark-button">
        <button
          type="button"
          href="#"
          title="Bookmark"
          onClick={this.handleClick}
          className={`btn btn-bookmark border-0
          ${`btn-${this.props.size}`}
          ${pageContainer.state.isBookmarked ? 'active' : ''}`}
          disabled={!isUserLoggedIn}
        >
          <i className="icon-star mr-3"></i>
          <span className="total-bookmarks">
            {pageContainer.state.sumOfBookmarks}
          </span>
        </button>

        {!isUserLoggedIn && (
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
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  pageId: PropTypes.string,
  t: PropTypes.func.isRequired,
  size: PropTypes.string,
};

BookmarkButton.defaultProps = {
  size: 'md',
};

export default withTranslation()(BookmarkButtonWrapper);
