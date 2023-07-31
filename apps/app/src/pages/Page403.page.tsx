import React from 'react';

import DefaultErrorPage from 'next/error';

export default function Page403() {
  return (
    <>
      <DefaultErrorPage statusCode={403} />
      {/* <h1>403 forbidden</h1> */}
    </>
  );
}
