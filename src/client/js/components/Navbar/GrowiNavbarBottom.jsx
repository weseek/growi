import React from 'react';
import PropTypes from 'prop-types';

import NavigationContainer from '../../services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

// import GlobalSearch from './GlobalSearch';

const GrowiNavbarBottom = (props) => {

  const {
    navigationContainer,
  } = props;
  const { isDrawerOpened, isDeviceSmallerThanMd } = navigationContainer.state;

  const additionalClasses = ['grw-navbar-bottom'];
  if (isDrawerOpened) {
    additionalClasses.push('grw-navbar-bottom-drawer-opened');
  }

  return (
    <div className="d-md-none d-edit-none fixed-bottom">

      { isDeviceSmallerThanMd && (
        <div id="grw-global-search-collapse" className="grw-global-search collapse bg-dark">
          <div className="p-3">
            {/* <GlobalSearch dropup /> */}
          </div>
        </div>
      ) }

      <div className={`navbar navbar-expand navbar-dark bg-primary px-0 ${additionalClasses.join(' ')}`}>

        <ul className="navbar-nav w-100">
          <li className="nav-item">
            <a type="button" className="nav-link btn-lg" onClick={() => navigationContainer.toggleDrawer()}>
              <i className="icon-menu"></i>
            </a>
          </li>
          <li className="nav-item mx-auto">
            <a type="button" className="nav-link btn-lg" data-target="#grw-global-search-collapse" data-toggle="collapse">
              <i className="icon-magnifier"></i>
            </a>
          </li>
          <li className="nav-item">
            <a type="button" className="nav-link btn-lg" onClick={() => navigationContainer.openPageCreateModal()}>
              <i className="icon-pencil"></i>
            </a>
          </li>
        </ul>
      </div>

    </div>
  );
};

GrowiNavbarBottom.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withUnstatedContainers(GrowiNavbarBottom, [NavigationContainer]);
