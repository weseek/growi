/* eslint-disable import/prefer-default-export */
import React, { Suspense } from 'react';

/**
 * If you throw a Promise in the component, it will display a sppiner
 * @param {object} Component A React.Component or functional component
 */
export function withLoadingSppiner(Component) {
  return (props => (
    // wrap with <Suspense></Suspense>
    <Suspense
      fallback={(
        <div className="my-5 text-center">
          <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <Component {...props} />;
    </Suspense>
  ));
}
