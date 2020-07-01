import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import NavigationContainer from '../services/NavigationContainer';
import { withUnstatedContainers } from './UnstatedUtils';

const logger = loggerFactory('growi:cli:MobileFooter');


const MobileFooter = (props) => {

  const {
    navigationContainer,
  } = props;
  const { isDrawerOpen } = navigationContainer.state;

  return (
    <div className="navbar navbar-expand navbar-dark bg-primary d-md-none fixed-bottom px-0">
      <ul className="navbar-nav w-100">
        <li className="nav-item">
          <a type="button" className="nav-link btn-lg"><i className="icon-menu"></i></a>
        </li>
        <li className="nav-item mx-auto">
          <a type="button" className="nav-link btn-lg"><i className="icon-magnifier"></i></a>
        </li>
        <li className="nav-item">
          <a type="button" className="nav-link btn-lg"><i className="icon-pencil"></i></a>
        </li>
      </ul>
    </div>
  );
};

MobileFooter.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withUnstatedContainers(MobileFooter, [NavigationContainer]);
