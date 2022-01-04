import React, { FC } from 'react';

import { UncontrolledTooltip } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { toastError } from '~/client/util/apiNotification';
import { useIsGuestUser } from '~/stores/context';
import PageContainer from '~/client/services/PageContainer';
import AppContainer from '~/client/services/AppContainer';

interface Props {
  pageContainer: PageContainer
  appContainer: AppContainer
  isBookmarked: boolean
  sumOfBookmarks: number
}

const BookmarkButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const {
    appContainer, pageContainer, isBookmarked, sumOfBookmarks,
  } = props;
  const { data: isGuestUser } = useIsGuestUser();


  const handleClick = async() => {

    if (isGuestUser) {
      return;
    }

    try {
      console.log('bookmark button pushed!');
      // toggleBookmark();
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <div>
      <button
        type="button"
        id="bookmark-button"
        onClick={handleClick}
        className={`btn btn-bookmark border-0 btn-md
        ${isBookmarked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
      >
        <i className="icon-star mr-3"></i>
        <span className="total-bookmarks">
          {sumOfBookmarks}
        </span>
      </button>

      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="bookmark-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </div>
  );
};

export default BookmarkButton;

// class BookmarkButton extends React.Component {

//   constructor(props) {
//     super(props);

//     this.handleClick = this.handleClick.bind(this);
//   }

//   async handleClick() {
//     const { appContainer, pageContainer } = this.props;
//     const { isGuestUser } = appContainer;

//     if (isGuestUser) {
//       return;
//     }

//     try {
//       pageContainer.toggleBookmark();
//     }
//     catch (err) {
//       toastError(err);
//     }
//   }


//   render() {
//     const { appContainer, pageContainer, t } = this.props;
//     const { isGuestUser } = appContainer;

//     return (
//       <div>
//         <button
//           type="button"
//           id="bookmark-button"
//           onClick={this.handleClick}
//           className={`btn btn-bookmark border-0
//           ${`btn-${this.props.size}`} ${pageContainer.state.isBookmarked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
//         >
//           <i className="icon-star mr-3"></i>
//           <span className="total-bookmarks">
//             {pageContainer.state.sumOfBookmarks}
//           </span>
//         </button>

//         {isGuestUser && (
//           <UncontrolledTooltip placement="top" target="bookmark-button" fade={false}>
//             {t('Not available for guest')}
//           </UncontrolledTooltip>
//         )}
//       </div>
//     );
//   }

// }

// /**
//  * Wrapper component for using unstated
//  */
// const BookmarkButtonWrapper = withUnstatedContainers(BookmarkButton, [AppContainer, PageContainer]);

// BookmarkButton.propTypes = {
//   appContainer: PropTypes.instanceOf(AppContainer).isRequired,
//   pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

//   pageId: PropTypes.string,
//   t: PropTypes.func.isRequired,
//   size: PropTypes.string,
// };

// BookmarkButton.defaultProps = {
//   size: 'md',
// };

// export default withTranslation()(BookmarkButtonWrapper);
