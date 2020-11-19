import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '../util/apiNotification';
import PageContainer from '../services/PageContainer';
import AppContainer from '../services/AppContainer';
import NavigationContainer from '../services/NavigationContainer';

class BookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const { pageContainer } = this.props;
    const isGuestUser = pageContainer.state.isGuestUser;

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
    const {
      appContainer, pageContainer, navigationContainer, t,
    } = this.props;
    const { isGuestUser } = appContainer;

    const { editorMode } = navigationContainer.state;

    const isViewMode = editorMode === 'view';

    return (
      <div>
        {isViewMode
        && (
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
        )}

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
const BookmarkButtonWrapper = withUnstatedContainers(BookmarkButton, [AppContainer, NavigationContainer, PageContainer]);

BookmarkButton.propTypes = {
  appContainer: PropTypes.instanceOf(PageContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageId: PropTypes.string,
  t: PropTypes.func.isRequired,
  size: PropTypes.string,
};

BookmarkButton.defaultProps = {
  size: 'md',
};

export default withTranslation()(BookmarkButtonWrapper);
