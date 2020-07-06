import React from 'react';
import PropTypes from 'prop-types';
import NavigationContainer from '../../services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';


/**
 *
 * @export
 * @extends {React.Component}
 */

class PageCreate extends React.Component {

  // when this is called it returns the hotkey stroke
  static getHotkeyStroke() {
    return ['c'];
  }

  static getComponent() {
    return <PageCreate />;
  }

  componentDidMount() {
    console.log(this.props);
    return null;
  }

  render() {
    return (
      <React.Fragment>
      </React.Fragment>
    );
  }

}
const PageCreateWrapper = withUnstatedContainers(PageCreate, [NavigationContainer]);

PageCreate.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default PageCreateWrapper;
