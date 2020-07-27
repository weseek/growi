import React from 'react';
import PropTypes from 'prop-types';

import UserPictureList from './UserPictureList';

import { withUnstatedContainers } from '../UnstatedUtils';

import PageContainer from '../../services/PageContainer';

class SeenUserList extends React.Component {

  render() {
    const { pageContainer } = this.props;
    return (
      <div className="dropdown text-right">
        <button className="btn btn-link dropdown-toggle text-danger" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i className="fa fa-fw fa-paw"></i>
          <span className="seen-user-count">{pageContainer.state.sumOfSeenUsers}</span>
        </button>
        <span className="dropdown-menu dropdown-menu-right px-2 col user-list-content text-truncate text-muted">
          <UserPictureList users={pageContainer.state.seenUsers} />
        </span>
      </div>
    );
  }

}


// class SeenUserList extends React.Component {

//   render() {
//     const { pageContainer } = this.props;
//     return (
//       <div className="user-list-content text-truncate text-muted text-right">
//         <button type="button" className="btn link" data-toggle="tooltip" data-placement="bottom" title="a">
//           <span className="text-danger">
//             <span className="seen-user-count">{pageContainer.state.sumOfSeenUsers}</span>
//             <i className="fa fa-fw fa-paw"></i>
//           </span>
//         </button>
//       </div>
//     );
//   }

// }

// class SeenUserList extends React.Component {

//   render() {
//     const { pageContainer } = this.props;
//     return (
//       <div className="user-list-content text-truncate text-muted text-right">
//         <span className="text-danger">
//           <span className="seen-user-count">{pageContainer.state.sumOfSeenUsers}</span>
//           <i className="fa fa-fw fa-paw"></i>
//         </span>
//         <span className="mr-1">
//           <UserPictureList users={pageContainer.state.seenUsers} />
//         </span>
//       </div>
//     );
//   }

// }

SeenUserList.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const SeenUserListWrapper = withUnstatedContainers(SeenUserList, [PageContainer]);

export default (SeenUserListWrapper);
