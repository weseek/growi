import React from 'react';
import PropTypes from 'prop-types';
import NavigationContainer from '../../services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';


/**
 *
 * @export
 * @extends {React.Component}
 */

export default class PageCreate extends React.Component {

  // when this is called it returns the hotkey stroke
  static getHotkeyStroke() {
    return [['c']];
  }

  static getComponent() {
    const PageCreateWrapper = withUnstatedContainers(PageCreate, [NavigationContainer]);
    return <PageCreateWrapper />;
  }

  componentDidMount() {
    this.props.navigationContainer.openPageCreateModal();
    return null;
  }

  render() {
    return (
      <React.Fragment>
      </React.Fragment>
    );
  }

}


PageCreate.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};
