import React, { Suspense } from 'react';

function withSuspense(Component) {
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

export default withSuspense;
