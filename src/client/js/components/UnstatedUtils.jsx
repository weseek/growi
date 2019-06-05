/* eslint-disable import/prefer-default-export */

import React from 'react';
import { Subscribe } from 'unstated';

/**
 * generate K/V object by specified instances
 *
 * @param {Array<object>} instances
 * @returns automatically named key and value
 *   e.g.
 *   {
 *     appContainer: <AppContainer />,
 *     exampleContainer: <ExampleContainer />,
 *   }
 */
function generateAutoNamedProps(instances) {
  const props = {};

  instances.forEach((instance) => {
    // get class name
    const className = instance.constructor.name;
    // convert initial charactor to lower case
    const propName = `${className.charAt(0).toLowerCase()}${className.slice(1)}`;

    props[propName] = instance;
  });

  return props;
}

/**
 * create React component instance that is injected specified containers
 *
 * @param {object} componentClass wrapped React.Component class
 * @param {*} props
 * @param {*} containerClasses unstated container classes to subscribe
 * @returns returns such like a following element:
 *  e.g.
 *  <Subscribe to={containerClasses}>  // containerClasses = [AppContainer, PageContainer]
 *    { (appContainer, pageContainer) => (
 *      <Component appContainer={appContainer} pageContainer={pageContainer} {...this.props} />
 *    )}
 *  </Subscribe>
 */
export function createSubscribedElement(componentClass, props, containerClasses) {
  return (
    // wrap with <Subscribe></Subscribe>
    <Subscribe to={containerClasses}>
      { (...containers) => {
        const propsForContainers = generateAutoNamedProps(containers);

        return React.createElement(
          componentClass,
          Object.assign(propsForContainers, props),
        );
      }}
    </Subscribe>
  );

}
